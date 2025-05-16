const mysqlConnection = require('../../utils/database');
const { io } = require('../../server'); // Ensure this path is correct
const webpush = require('web-push');
// const NewNotification = async (req, res) => {
//     try {
//         const { ids, assigned_to, view_dt, assigned_on, assigned_through } = req.body;
       

//         // Query to get the name of the user assigned through
//         const [leads] = await mysqlConnection.promise().query("SELECT name FROM users WHERE email=?", [assigned_through]);
//         if (leads.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Assigned through user not found',
//             });
//         }
//         const assignedThroughName = leads[0].name;

//         // Query to get the name of the user assigned to
//         const [ass_to] = await mysqlConnection.promise().query("SELECT name FROM users WHERE id=?", [assigned_to]);
//         if (ass_to.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Assigned to user not found',
//             });
//         }
//         const assignedToName = ass_to[0].name;

//         // Insert a new notification for each id
//         for (const id of ids) {
//             const sql = 'INSERT INTO leads_notification (leadId, assigned_to, assigned_through, user) VALUES (?, ?, ?, ?)';
//             const values = [id, assignedToName, assignedThroughName, assignedThroughName];
//             await mysqlConnection.promise().query(sql, values);

//             // Emit the notification to the assigned user
//             io?.to(assigned_to).emit('notification', {
//                 message: `New Notification created for lead ID: ${id}`,
//             });
//         }
//         await sendNotificationToUser(assignedToName, `New Notification created for Leads`);
//         res.status(200).json({
//             success: true,
//             message: 'Notifications created successfully',
//         });
//     } catch (error) {
//         console.error('Error creating notification:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error in creating notification',
//             error: error.message,
//         });
//     }
// };



const AutoNewNotification = async (req, res) => {
  try {
    const { ids, assigned_to, view_dt, assigned_on, assigned_through } = req.body;

    // Query to get the name of the user assigned through
    const [leads] = await mysqlConnection.promise().query("SELECT name FROM users WHERE email=?", [assigned_through]);
    if (leads.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Assigned through user not found',
      });
    }
    const assignedThroughName = leads[0].name;
  
    // Query to get the name of the user assigned to
    const [ass_to] = await mysqlConnection.promise().query("SELECT name, mobile, sms FROM users WHERE id=?", [assigned_to]);
    if (ass_to.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Assigned to user not found',
      });
    }

    const assignedToName = ass_to[0].name;
    const assignedToPhone = ass_to[0].mobile; // Assuming the phone number field is 'phone'
    const sms = ass_to[0].sms;
  
    // Insert a new notification for each id
    for (const id of ids) {
      const sql = 'INSERT INTO leads_notification (leadId, assigned_to, assigned_through, user) VALUES (?, ?, ?, ?)';
      const values = [id, assignedToName, assignedThroughName, assignedThroughName];
      await mysqlConnection.promise().query(sql, values);

      // Emit the notification to the assigned user
      io?.to(assigned_to).emit('notification', {
        message: `New Notification created for lead ID: ${id}`,
      });
    }

    // Send SMS to the assigned user
    const messageText = `You have been assigned new leads. Please check your notifications.`;
    // const mask = 'Elaan Mrktg'; 
    const formattedPhone = `92${assignedToPhone.slice(1)}`;
    // await sendMessage([formattedPhone], messageText);
    if(sms==="Y"){const response=await sendMessage([`923032144362`], messageText);
    
  }
  
    res.status(200).json({
      success: true,
      message: 'Notifications created successfully and message sent',
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error in creating notification',
      error: error.message,
    });
  }
};

const NewNotification = async (req, res) => {
    try {
      const { ids, assigned_to, view_dt, assigned_on, assigned_through } = req.body;
  
      // Query to get the name of the user assigned through
      const [leads] = await mysqlConnection.promise().query("SELECT name FROM users WHERE email=?", [assigned_through]);
      if (leads.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Assigned through user not found',
        });
      }
      const assignedThroughName = leads[0].name;
    
      // Query to get the name of the user assigned to
      const [ass_to] = await mysqlConnection.promise().query("SELECT name, mobile, sms FROM users WHERE id=?", [assigned_to]);
      if (ass_to.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Assigned to user not found',
        });
      }

      const assignedToName = ass_to[0].name;
      const assignedToPhone = ass_to[0].mobile; // Assuming the phone number field is 'phone'
      const sms = ass_to[0].sms;
    
      // Insert a new notification for each id
      for (const id of ids) {
        const sql = 'INSERT INTO leads_notification (leadId, assigned_to, assigned_through, user) VALUES (?, ?, ?, ?)';
        const values = [id, assignedToName, assignedThroughName, assignedThroughName];
        await mysqlConnection.promise().query(sql, values);
  
        // Emit the notification to the assigned user
        io?.to(assigned_to).emit('notification', {
          message: `New Notification created for lead ID: ${id}`,
        });
      }
  
      // Send SMS to the assigned user
      const messageText = `You have been assigned new leads. Please check your notifications.`;
      // const mask = 'Elaan Mrktg'; 
      const formattedPhone = `92${assignedToPhone.slice(1)}`;
      // await sendMessage([formattedPhone], messageText);
      if(sms==="Y"){const response=await sendMessage([`923105223105`], messageText);
      
    }
    
      res.status(200).json({
        success: true,
        message: 'Notifications created successfully and message sent',
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      res.status(500).json({
        success: false,
        message: 'Error in creating notification',
        error: error.message,
      });
    }
  };
  
  
const GetNotification = async (req, res) => {
    try {
      // Retrieve the user email from the request query parameters
      const { email } = req.params;
    
  
      // Fetch the user details based on the email
      const [leads] = await mysqlConnection.promise().query("SELECT name FROM users WHERE email=?", [email]);
      if (!leads.length) {
        return res.status(400).json({
          success: false,
          message: 'No Notification Received Yet',
        });
      }
  
      // Construct the SQL query to get notifications
      const query = 'SELECT * FROM leads_notification WHERE assigned_to = ?';
      const results = await new Promise((resolve, reject) => {
        mysqlConnection.query(query, [leads[0].name], (error, results) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(results);
        });
      });
       
      // Count the notifications where notification_mark is false or 0
      const unreadCount = results.filter(notification => notification.notification_mark === 0).length;
  
      // Send the response with the notifications and the count of unread notifications
      res.status(200).json({
        success: true,
        message: "User details with notifications",
        results,
        unreadCount: unreadCount || 0,
      });
    } catch (error) {
      console.error('Error executing MySQL query:', error);
      res.status(500).json({ success: false, message: "Internal Server Error", error });
    }
  };
  

  
const updateNotificationMark = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const {leadId}=req.query;
        const currentTimestamp  = Math.floor(Date.now() / 1000);
      
        // Update the notification_mark field to mark the notification as read
      //   const [viewdate] = await mysqlConnection.promise().query(
      //     "UPDATE leads_main SET view_dt = ? WHERE id = ?",
      //     [currentTimestamp, leadId] // Pass the current timestamp and leadId
      // );


        const [result] = await mysqlConnection.promise().query(
            "UPDATE leads_notification SET notification_mark = ? WHERE id = ?",
            [true, notificationId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification marked as read successfully',
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Error in marking notification as read',
            error: error.message,
        });
    }
};



const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BBVPcdOTcge5pKMiWxgWfBEm2ugpF-NZ6soK9l0bKTpMoXuaShylZcZwor43CYhG4YzOgHuCvnqwM9Fd0wTKLp4";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "EFjxKzqZ6FPxkb0ctu_sBkAxm40A1ymjAdgHkChTZq4";

webpush.setVapidDetails(
  'mailto:engr.basitofficial@gmail.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);
const saveSubscription = async (req, res) => {
  const subscription = req.body;
  const { email } = req.params;


  try {
      const [leads] = await mysqlConnection.promise().query("SELECT name FROM users WHERE email=?", [email]);
      if (leads.length === 0) {
          return res.status(404).json({ message: 'User not found' });
      }

      const username = leads[0].name;
      

      await saveSubscriptionToDatabase(username, subscription);
      res.status(201).json({ message: 'Subscription saved successfully' });
  } catch (error) {
      console.error('Error saving subscription:', error);
      res.status(500).json({ message: 'Failed to save subscription' });
  }
};

async function saveSubscriptionToDatabase(username, subscription) {
  const query = 'INSERT INTO lead_subscription (username, subscription) VALUES (?, ?) ON DUPLICATE KEY UPDATE subscription = VALUES(subscription)';
  await mysqlConnection.promise().query(query, [username, JSON.stringify(subscription)]);
}

const sendNotificationToUser = async (username, leadDetails) => {
  try {
    const [results] = await mysqlConnection.promise().query(
      'SELECT subscription FROM lead_subscription WHERE username = ?', 
      [username]
    );

    if (results.length === 0) {
      console.warn(`No subscription found for user: ${username}`);
      return false;
    }

    const subscriptionData = results[0].subscription;
    const subscription = JSON.parse(subscriptionData);

    if (!subscription?.endpoint) {
      console.error('Invalid subscription object:', subscription);
      return false;
    }

    const payload = JSON.stringify({
      title: 'New Lead Assigned',
      body: `You've been assigned a new lead: ${leadDetails.name || 'Lead #'+leadDetails.id}`,
      icon: '/icons/icon-192x192.png',
      data: {
        url: `/leads/${leadDetails.id}`, // URL to open when notification is clicked
        leadId: leadDetails.id
      }
    });

    await webpush.sendNotification(subscription, payload);
    console.log(`Notification sent successfully to ${username}`);
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    
    // Remove invalid subscriptions
    if (error.statusCode === 410) { // GONE status (subscription no longer valid)
      await mysqlConnection.promise().query(
        'DELETE FROM lead_subscription WHERE username = ?',
        [username]
      );
      console.log(`Removed expired subscription for ${username}`);
    }
    return false;
  }
};


const axios = require('axios');

const sendMessage = async (to, text, unicode = false) => {
  try {
    const [result] = await mysqlConnection.promise().query("SELECT msisdn, password, mask FROM leads_sms_credentials");
    const msisdn=result[0].msisdn;
    const password=result[0].password;
    const mask=result[0].mask;
    const authResponse = await axios.get('https://telenorcsms.com.pk:27677/corporate_sms2/api/auth.jsp', {
      params: {
        msisdn: msisdn,
        password: password
      }
    });
    console.log("the result of the message when sent to some one:",authResponse)

    const sessionId = authResponse.data.match(/<data>(.*)<\/data>/)[1];

    const sendResponse = await axios.get('https://telenorcsms.com.pk:27677/corporate_sms2/api/sendsms.jsp', {
      params: {
        session_id: sessionId,
        to: to.join(','),
        text,
        mask,
        unicode: unicode ? 'true' : 'false'
      }
    });

    return sendResponse.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};



module.exports = { saveSubscription, NewNotification, GetNotification,updateNotificationMark, sendMessage, sendNotificationToUser};
