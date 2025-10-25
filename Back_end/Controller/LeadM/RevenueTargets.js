const mysqlConnection = require('../../utils/database');
const CreateTargetRevenue = async (req, res) => {
  try {
    const { id: rawId } = req.query; // optional users.id
    const {
      designation,
      targetRevenue,
      achievedRevenue,
      date,               // 'YYYY-MM-DD' (required to choose the month)
      user: incomingUser, // e.g. "ehtesham" -> we store this as name
      name,               // optional; if provided, it overrides incomingUser
    } = req.body ?? {};

    // --- required: date -> period_year/month ---
    if (!date || typeof date !== 'string') {
      return res.status(400).json({ success: false, message: 'date is required as YYYY-MM-DD' });
    }
    const parts = date.split('-');
    if (parts.length !== 3) {
      return res.status(400).json({ success: false, message: 'date must be in format YYYY-MM-DD' });
    }
    const period_year = Number(parts[0]);
    const period_month = Number(parts[1]);
    if (!Number.isInteger(period_year) || !Number.isInteger(period_month) || period_month < 1 || period_month > 12) {
      return res.status(400).json({ success: false, message: 'Invalid year or month in date' });
    }

    const incomingName = (name ?? incomingUser ?? null);

    // --- helpers ---
    const parseMoney = (v, field) => {
      if (v === undefined) return undefined;
      const n = Number(v);
      if (!Number.isFinite(n)) {
        const err = new Error(`${field} must be a valid number`);
        err.status = 400;
        throw err;
      }
      return n < 0 ? 0 : Number(n.toFixed(2));
    };

    const tr = parseMoney(targetRevenue, 'targetRevenue');
    const ar = parseMoney(achievedRevenue, 'achievedRevenue');

    if (tr === undefined && ar === undefined && incomingName === null) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one of: targetRevenue, achievedRevenue, user/name'
      });
    }

    // ---------- Branch A: ?id= provided -> UPSERT monthly row for that user & period ----------
    if (rawId !== undefined) {
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      const userId = Number(id);
      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid id' });
      }

      // make sure user exists and is active
      const [urows] = await mysqlConnection.promise().query(
        `SELECT id FROM users WHERE del='N' AND id=?`,
        [userId]
      );
      if (urows.length === 0) {
        return res.status(404).json({ success: false, message: `No active user found with id ${userId}` });
      }

      // Build INSERT ... ON DUPLICATE KEY UPDATE for that (user, year, month)
      const cols = ['user', 'period_year', 'period_month'];
      const vals = [userId, period_year, period_month];

      if (incomingName !== null) { cols.push('name'); vals.push(incomingName); }
      if (tr !== undefined)      { cols.push('targetRevenue'); vals.push(tr); }
      if (ar !== undefined)      { cols.push('achievedRevenue'); vals.push(ar); }

      const placeholders = cols.map(() => '?').join(', ');
      const updates = [];
      if (incomingName !== null) updates.push('name=VALUES(name)');
      if (tr !== undefined)      updates.push('targetRevenue=VALUES(targetRevenue)');
      if (ar !== undefined)      updates.push('achievedRevenue=VALUES(achievedRevenue)');
      if (updates.length === 0)  updates.push('id=id'); // no-op

      const sql = `
        INSERT INTO revenue_targets_monthly (${cols.join(', ')})
        VALUES (${placeholders})
        ON DUPLICATE KEY UPDATE ${updates.join(', ')}
      `;

      const [result] = await mysqlConnection.promise().execute(sql, vals);

      return res.status(200).json({
        success: true,
        message: `Monthly revenue target upserted for user ${userId} for ${period_year}-${String(period_month).padStart(2,'0')}.`,
        meta: { affectedRows: result.affectedRows, insertId: result.insertId ?? null, info: result.info ?? null }
      });
    }

    // ---------- Branch B: No ?id -> use designation over all active users ----------
    if (!designation || typeof designation !== 'string') {
      return res.status(400).json({ success: false, message: 'designation is required (string) when id is not provided' });
    }

    // Pull active users with this designation
    const [users] = await mysqlConnection.promise().query(
      `SELECT id FROM users WHERE del='N' AND designation = ?`,
      [designation]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No active users found with designation "${designation}".`
      });
    }

    // Check if any row already exists for this period for ANY of these users
    const userIds = users.map(u => u.id);
    const placeholdersIn = userIds.map(() => '?').join(', ');
    const [existing] = await mysqlConnection.promise().query(
      `
        SELECT user
        FROM revenue_targets_monthly
        WHERE period_year=? AND period_month=? AND user IN (${placeholdersIn})
      `,
      [period_year, period_month, ...userIds]
    );

    if (existing.length > 0) {
      // already exists for at least one user -> do not write, just notify
      return res.status(409).json({
        success: false,
        message: `Monthly revenue target already exists for ${existing.length} user(s) for ${period_year}-${String(period_month).padStart(2,'0')} under designation "${designation}".`
      });
    }

    // None exist -> INSERT rows (no update here)
    const cols = ['user', 'period_year', 'period_month'];
    if (incomingName !== null) cols.push('name');
    if (tr   !== undefined)    cols.push('targetRevenue');
    if (ar   !== undefined)    cols.push('achievedRevenue');

    const rowPH = `(${cols.map(() => '?').join(', ')})`;
    const rowsSql = users.map(() => rowPH).join(', ');

    const values = [];
    for (const u of users) {
      values.push(u.id, period_year, period_month);
      if (incomingName !== null) values.push(incomingName);
      if (tr   !== undefined)    values.push(tr);
      if (ar   !== undefined)    values.push(ar);
    }

    const insertSql = `
      INSERT INTO revenue_targets_monthly (${cols.join(', ')})
      VALUES ${rowsSql}
    `;

    const [insertResult] = await mysqlConnection.promise().execute(insertSql, values);

    return res.status(200).json({
      success: true,
      message: `Inserted monthly revenue targets for ${users.length} user(s) with designation "${designation}" for ${period_year}-${String(period_month).padStart(2,'0')}.`,
      meta: { affectedRows: insertResult.affectedRows, info: insertResult.info ?? null }
    });

  } catch (error) {
    const status = error?.status || 500;
    console.error('CreateTargetRevenue (monthly by date) error:', error);
    return res.status(status).json({ success: false, message: error?.message || 'Internal Server Error' });
  }
};

// GET /revenue-targets/:id?date=YYYY-MM-DD
const getMonthlyTargetById = async (req, res) => {
  try {
    const { id: rawId } = req.params;
    const { date } = req.query;

    const userId = Number(rawId);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }
    if (!date || typeof date !== 'string') {
      return res.status(400).json({ success: false, message: 'date is required as YYYY-MM-DD' });
    }

    const [y, m] = date.split('-');
    const period_year  = Number(y);
    const period_month = Number(m);
    if (!Number.isInteger(period_year) || !Number.isInteger(period_month) || period_month < 1 || period_month > 12) {
      return res.status(400).json({ success: false, message: 'Invalid date' });
    }

    // ensure user exists
    const [u] = await mysqlConnection.promise().query(
      `SELECT id, designation, CONCAT(IFNULL(first_name,''),' ',IFNULL(last_name,'')) AS full_name
       FROM users WHERE del='N' AND id=?`,
      [userId]
    );
    if (u.length === 0) {
      return res.status(404).json({ success: false, message: `No active user found with id ${userId}` });
    }

    const [rows] = await mysqlConnection.promise().query(
      `SELECT id, user, name, period_year, period_month, targetRevenue, achievedRevenue
         FROM revenue_targets_monthly
        WHERE user=? AND period_year=? AND period_month=?`,
      [userId, period_year, period_month]
    );

    if (rows.length === 0) {
      // Return a friendly empty payload (handy for the UI)
      return res.status(200).json({
        success: true,
        data: {
          user: userId,
          designation: u[0].designation ?? null,
          name: null, // not set yet for this month
          period_year,
          period_month,
          targetRevenue: 0,
          achievedRevenue: 0,
          exists: false,
        }
      });
    }

    const r = rows[0];
    return res.status(200).json({
      success: true,
      data: {
        id: r.id,
        user: r.user,
        designation: u[0].designation ?? null,
        name: r.name,
        period_year: r.period_year,
        period_month: r.period_month,
        targetRevenue: Number(r.targetRevenue),
        achievedRevenue: Number(r.achievedRevenue),
        exists: true,
      }
    });
  } catch (err) {
    console.error('getMonthlyTargetById error:', err);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
// GET /revenue-targets?year=2025&month=10&designation=Manager%20Sales&page=1&pageSize=20
const listMonthlyTargets = async (req, res) => {
  try {
    const year  = req.query.year ? Number(req.query.year)   : null;
    const month = req.query.month ? Number(req.query.month) : null;
    const { designation } = req.query;
    const page     = Math.max(1, Number(req.query.page ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize ?? 20)));
    const offset   = (page - 1) * pageSize;

    const where = [];
    const args  = [];

    if (year)  { where.push('rtm.period_year=?');  args.push(year); }
    if (month) { where.push('rtm.period_month=?'); args.push(month); }
    if (designation) { where.push('u.designation=?'); args.push(designation); }
    where.push("u.del='N'");

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*) AS total
      FROM revenue_targets_monthly rtm
      JOIN users u ON u.id = rtm.user
      ${whereSql}
    `;
    const [cnt] = await mysqlConnection.promise().query(countSql, args);
    const total = cnt[0]?.total ?? 0;

    const dataSql = `
      SELECT 
        rtm.id, rtm.user, rtm.name, rtm.period_year, rtm.period_month,
        rtm.targetRevenue, rtm.achievedRevenue,
        u.designation, CONCAT(IFNULL(u.first_name,''),' ',IFNULL(u.last_name,'')) AS full_name
      FROM revenue_targets_monthly rtm
      JOIN users u ON u.id = rtm.user
      ${whereSql}
      ORDER BY rtm.period_year DESC, rtm.period_month DESC, rtm.user ASC
      LIMIT ? OFFSET ?`;

    const [rows] = await mysqlConnection.promise().query(
      dataSql,
      [...args, pageSize, offset]
    );

    return res.status(200).json({
      success: true,
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
      data: rows.map(r => ({
        id: r.id,
        user: r.user,
        name: r.name,
        designation: r.designation,
        full_name: r.full_name,
        period_year: r.period_year,
        period_month: r.period_month,
        targetRevenue: Number(r.targetRevenue),
        achievedRevenue: Number(r.achievedRevenue),
      }))
    });
  } catch (err) {
    console.error('listMonthlyTargets error:', err);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const MonthlyTargets = async (req, res) => {
  try {
    // Normalize inputs
    const id = String(req.query.id || '').trim();
    const perm = Number(req.query.permission || 0);
    const role = String(req.query.role || '').toLowerCase();

    console.log('The id, permission, and role are:', id, perm, role);

    // ADMIN: all users aggregated across months
    if (perm >= 9) {
      console.log('Admin or high-permission branch (>=9)');
      const [results] = await mysqlConnection
        .promise()
        .query(
          `
            SELECT 
              u.id,
              u.name,
              u.email,
              COALESCE(SUM(rt.targetRevenue), 0)   AS targetRevenue,
              COALESCE(SUM(rt.achievedRevenue), 0) AS achievedRevenue
            FROM users u
            JOIN revenue_targets_monthly rt ON u.id = rt.user
            GROUP BY u.id, u.name, u.email
          `
        );

      const data = results.map((user) => {
        const target = Number(user.targetRevenue) || 0;
        const achieved = Number(user.achievedRevenue) || 0;
        const percentage = target > 0 ? ((achieved / target) * 100).toFixed(2) : '0.00';
        return { ...user, targetRevenue: target, achievedRevenue: achieved, percentage };
      });

      return res.status(200).json({ success: true, data });
    }

    // MANAGER: own + team aggregated across months
    if (perm >= 4 || role === 'manager') {
      console.log('Manager branch (perm >=4 or role=manager)');
      if (!id) {
        return res.status(400).json({ success: false, message: 'Missing manager id' });
      }

      const [results] = await mysqlConnection
        .promise()
        .query(
          `
            SELECT 
              u.id,
              u.name,
              u.email,
              COALESCE(SUM(rt.targetRevenue), 0)   AS targetRevenue,
              COALESCE(SUM(rt.achievedRevenue), 0) AS achievedRevenue
            FROM users u
            JOIN revenue_targets_monthly rt ON u.id = rt.user
            JOIN users_teams as ut ON rt.user=ut.manager_id
            WHERE rt.user OR u.id=?
            GROUP BY u.id, u.name, u.email
          `,
          [id, id]
        );

      const data = results.map((user) => {
        const target = Number(user.targetRevenue) || 0;
        const achieved = Number(user.achievedRevenue) || 0;
        const percentage = target > 0 ? ((achieved / target) * 100).toFixed(2) : '0.00';
        return { ...user, targetRevenue: target, achievedRevenue: achieved, percentage };
      });

      return res.status(200).json({ success: true, data });
    }

    // SIMPLE USER: only their totals aggregated across months
    if (!id) {
      return res.status(400).json({ success: false, message: 'Missing user id' });
    }

    const [rows] = await mysqlConnection
      .promise()
      .query(
        `
          SELECT 
            u.name,
            COALESCE(SUM(rt.targetRevenue), 0)   AS targetRevenue,
            COALESCE(SUM(rt.achievedRevenue), 0) AS achievedRevenue
          FROM revenue_targets_monthly rt
          JOIN users u ON rt.user = u.id
          WHERE rt.user = ?
        `,
        [id]
      );

    const user = rows[0] || { name: null, targetRevenue: 0, achievedRevenue: 0 };
    const target = Number(user.targetRevenue) || 0;
    const achieved = Number(user.achievedRevenue) || 0;
    const percentage = target > 0 ? ((achieved / target) * 100).toFixed(2) : '0.00';

    return res.status(200).json({
      success: true,
      data: { name: user.name, targetRevenue: target, achievedRevenue: achieved, percentage },
    });
  } catch (error) {
    console.error('Error fetching revenue targets:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


  
  
module.exports = { CreateTargetRevenue, getMonthlyTargetById, listMonthlyTargets,MonthlyTargets };
