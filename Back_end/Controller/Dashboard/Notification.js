// controllers/notifications.js
const mysqlConnection = require('../../utils/database');
const { io } = require('../../server'); // Ensure this path is correct
const webpush = require('web-push');
const axios = require('axios');

/**
 * VAPID keys — MUST match the public key used in pushManager.subscribe()
 * Don't mix dev/prod keys.
 */
const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BBVPcdOTcge5pKMiWxgWfBEm2ugpF-NZ6soK9l0bKTpMoXuaShylZcZwor43CYhG4YzOgHuCvnqwM9Fd0wTKLp4';

const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY ||
  'EFjxKzqZ6FPxkb0ctu_sBkAxm40A1ymjAdgHkChTZq4';

webpush.setVapidDetails(
  'mailto:engr.basitofficial@gmail.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

/**
 * Save (or upsert) a user's Web Push subscription.
 * Expects req.body = { subscription: { endpoint, keys: {p256dh, auth}, ... } }
 * and req.params.email
 */
const saveSubscription = async (req, res) => {
  const { subscription } = req.body; // ← correct: the raw PushSubscription JSON
  const { email } = req.params;

  try {
    const [users] = await mysqlConnection
      .promise()
      .query('SELECT name FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const username = users[0].name;

    await saveSubscriptionToDatabase(username, subscription);
    return res.status(201).json({ message: 'Subscription saved successfully' });
  } catch (error) {
    console.error('Error saving subscription:', error);
    return res.status(500).json({ message: 'Failed to save subscription' });
  }
};

/**
 * Persist subscription as plain JSON (no nested "body" string).
 * Table suggestion:
 *   CREATE TABLE lead_subscription (
 *     username VARCHAR(191) NOT NULL PRIMARY KEY,
 *     subscription JSON NOT NULL
 *   );
 *
 * If username isn't unique, make username unique or use (username, endpoint) unique
 * and adapt the upsert accordingly.
 */
async function saveSubscriptionToDatabase(username, subscription) {
  const query = `
    INSERT INTO lead_subscription (username, subscription)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE subscription = VALUES(subscription)
  `;
  await mysqlConnection
    .promise()
    .query(query, [username, JSON.stringify(subscription)]);
}

/**
 * Send a Web Push to a specific user by username.
 * leadDetails can be an object or a simple string; we normalize it.
 * Automatically deletes subscription if FCM returns 404/410.
 */
const sendNotificationToUser = async (username, leadDetails) => {
  try {
    const [rows] = await mysqlConnection
      .promise()
      .query('SELECT subscription FROM lead_subscription WHERE username = ?', [
        username,
      ]);

    if (rows.length === 0) {
      console.warn(`No subscription found for user: ${username}`);
      return false;
    }

    // Parse ONCE — we stored plain JSON
    const subscription = JSON.parse(rows[0].subscription);

    if (!subscription?.endpoint) {
      console.error('Invalid subscription object:', subscription);
      return false;
    }

    // Normalize lead details for payload
    const leadId =
      typeof leadDetails === 'object' && leadDetails?.id
        ? leadDetails.id
        : undefined;

    const bodyText =
      typeof leadDetails === 'string'
        ? leadDetails
        : `You've been assigned a new lead${
            leadId ? `: Lead #${leadId}` : ''
          }`;

    const payload = JSON.stringify({
      title: 'New Lead Assigned',
      body: bodyText,
      icon: '/icons/icon-192x192.png',
      data: {
        url: leadId ? `/leads/${leadId}` : '/leads',
        leadId: leadId || null,
      },
    });

    await webpush.sendNotification(subscription, payload);
    console.log(`Notification sent successfully to ${username}`);
    return true;
  } catch (error) {
    console.error('Error sending notification:', {
      statusCode: error?.statusCode,
      body: error?.body,
      message: error?.message,
    });

    // Remove invalid / expired subscriptions
    if (error?.statusCode === 404 || error?.statusCode === 410) {
      await mysqlConnection
        .promise()
        .query('DELETE FROM lead_subscription WHERE username = ?', [username]);
      console.log(`Removed expired subscription for ${username}`);
    }

    return false;
  }
};

/**
 * SMS sender via Telenor Corporate SMS.
 * Pulls creds from DB (leads_sms_credentials).
 */
const sendMessage = async (to, text, unicode = false) => {
  try {
    const [creds] = await mysqlConnection
      .promise()
      .query(
        'SELECT msisdn, password, mask FROM leads_sms_credentials LIMIT 1'
      );

    if (!creds.length) {
      throw new Error('SMS credentials not configured');
    }

    const { msisdn, password, mask } = creds[0];

    const authResponse = await axios.get(
      'https://telenorcsms.com.pk:27677/corporate_sms2/api/auth.jsp',
      {
        params: {
          msisdn,
          password,
        },
      }
    );

    const match = String(authResponse.data).match(/<data>(.*)<\/data>/);
    if (!match) throw new Error('Failed to obtain SMS session_id');
    const sessionId = match[1];

    const sendResponse = await axios.get(
      'https://telenorcsms.com.pk:27677/corporate_sms2/api/sendsms.jsp',
      {
        params: {
          session_id: sessionId,
          to: to.join(','), // comma-separated list
          text,
          mask,
          unicode: unicode ? 'true' : 'false',
        },
      }
    );

    return sendResponse.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Utility: format PK mobile "03xxxxxxxxx" → "92xxxxxxxxxx"
 */
const toE164PK = (msisdnLike) => {
  if (!msisdnLike) return null;
  const s = String(msisdnLike).trim();
  if (s.startsWith('92')) return s;
  if (s.startsWith('0')) return `92${s.slice(1)}`;
  return s; // as-is fallback (assume already E.164)
};

/**
 * Create notifications + socket emit + optional SMS (auto)
 */
const AutoNewNotification = async (req, res) => {
  try {
    const { ids = [], assigned_to, assigned_through } = req.body;

    // Who assigned the leads (by email → name)
    const [throughRows] = await mysqlConnection
      .promise()
      .query('SELECT name FROM users WHERE email = ?', [assigned_through]);

    if (!throughRows.length) {
      return res.status(400).json({
        success: false,
        message: 'Assigned through user not found',
      });
    }
    const assignedThroughName = throughRows[0].name;

    // Who receives the leads (by id → name, mobile, sms pref)
    const [toRows] = await mysqlConnection
      .promise()
      .query('SELECT name, mobile, sms FROM users WHERE id = ?', [assigned_to]);

    if (!toRows.length) {
      return res.status(400).json({
        success: false,
        message: 'Assigned to user not found',
      });
    }

    const assignedToName = toRows[0].name;
    const assignedToPhone = toRows[0].mobile;
    const smsPref = toRows[0].sms;

    // Insert notifications
    for (const id of ids) {
      const sql =
        'INSERT INTO leads_notification (leadId, assigned_to, assigned_through, user) VALUES (?, ?, ?, ?)';
      const values = [id, assignedToName, assignedThroughName, assignedThroughName];
      await mysqlConnection.promise().query(sql, values);

      // Realtime emit
      io?.to(String(assigned_to)).emit('notification', {
        message: `New Notification created for lead ID: ${id}`,
      });
    }

    // Web Push (optional — send one summary notification)
    await sendNotificationToUser(assignedToName, 'New leads have been assigned to you.');

    // SMS (if user opted in)
    if (smsPref === 'Y' && assignedToPhone) {
      const messageText =
        'You have been assigned new leads. Please check your notifications.';
      const formattedPhone = toE164PK(assignedToPhone);
      if (formattedPhone) {
        await sendMessage([formattedPhone], messageText);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Notifications created successfully (push + optional SMS).',
    });
  } catch (error) {
    console.error('Error creating notification (auto):', error);
    return res.status(500).json({
      success: false,
      message: 'Error in creating notification',
      error: error.message,
    });
  }
};

/**
 * Create notifications + socket emit + optional SMS (manual)
 */
const NewNotification = async (req, res) => {
  try {
    const { ids = [], assigned_to, assigned_through } = req.body;

    // Assigned through: email → name
    const [throughRows] = await mysqlConnection
      .promise()
      .query('SELECT name FROM users WHERE email = ?', [assigned_through]);
    if (!throughRows.length) {
      return res.status(400).json({
        success: false,
        message: 'Assigned through user not found',
      });
    }
    const assignedThroughName = throughRows[0].name;

    // Assigned to: id → name, mobile, sms
    const [toRows] = await mysqlConnection
      .promise()
      .query('SELECT name, mobile, sms FROM users WHERE id = ?', [assigned_to]);
    if (!toRows.length) {
      return res.status(400).json({
        success: false,
        message: 'Assigned to user not found',
      });
    }

    const assignedToName = toRows[0].name;
    const assignedToPhone = toRows[0].mobile;
    const smsPref = toRows[0].sms;

    // Insert notifications
    for (const id of ids) {
      const sql =
        'INSERT INTO leads_notification (leadId, assigned_to, assigned_through, user) VALUES (?, ?, ?, ?)';
      const values = [id, assignedToName, assignedThroughName, assignedThroughName];
      await mysqlConnection.promise().query(sql, values);

      // Realtime emit
      io?.to(String(assigned_to)).emit('notification', {
        message: `New Notification created for lead ID: ${id}`,
      });
    }

    // Web Push
    await sendNotificationToUser(assignedToName, 'New leads have been assigned to you.');

    // SMS (if opted in)
    if (smsPref === 'Y' && assignedToPhone) {
      const messageText =
        'You have been assigned new leads. Please check your notifications.';
      const formattedPhone = toE164PK(assignedToPhone);
      if (formattedPhone) {
        await sendMessage([formattedPhone], messageText);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Notifications created successfully (push + optional SMS).',
    });
  } catch (error) {
    console.error('Error creating notification (manual):', error);
    return res.status(500).json({
      success: false,
      message: 'Error in creating notification',
      error: error.message,
    });
  }
};

/**
 * Fetch notifications for a user by email.
 * Returns notifications + unread count.
 */
const GetNotification = async (req, res) => {
  try {
    const { email } = req.params;

    const [users] = await mysqlConnection
      .promise()
      .query('SELECT name FROM users WHERE email = ?', [email]);

    if (!users.length) {
      return res.status(400).json({
        success: false,
        message: 'No Notification Received Yet',
      });
    }

    const username = users[0].name;

    const query = 'SELECT * FROM leads_notification WHERE assigned_to = ?';
    const results = await new Promise((resolve, reject) => {
      mysqlConnection.query(query, [username], (error, rows) => {
        if (error) return reject(error);
        resolve(rows);
      });
    });

    const unreadCount = results.filter(
      (n) => Number(n.notification_mark) === 0
    ).length;

    return res.status(200).json({
      success: true,
      message: 'User details with notifications',
      results,
      unreadCount: unreadCount || 0,
    });
  } catch (error) {
    console.error('Error executing MySQL query:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error', error });
  }
};

/**
 * Mark a notification as read.
 */
const updateNotificationMark = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const [result] = await mysqlConnection
      .promise()
      .query('UPDATE leads_notification SET notification_mark = ? WHERE id = ?', [
        true,
        notificationId,
      ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read successfully',
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Error in marking notification as read',
      error: error.message,
    });
  }
};

module.exports = {
  saveSubscription,
  NewNotification,
  AutoNewNotification,
  GetNotification,
  updateNotificationMark,
  sendMessage,
  sendNotificationToUser,
};
