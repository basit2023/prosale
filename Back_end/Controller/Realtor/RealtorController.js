// controllers/businessProfiles.controller.js
const mysqlConnection = require('../../utils/database');
// If you already created a zod schema, you can import it here instead of hand-rolling checks:
// const { BusinessProfileSchema } = require('@/utils/validators/business-profile.schema');

function dbQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    mysqlConnection.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

/**
 * POST /business-profiles
 * Body: {
 *   full_name, relation_type, guardian_name, gender, dob, cnic, mobile, email,
 *   address, city, nationality, ntn, filer_status, reference, authorized_partner, partner_cnic,
 *   office_name, office_mobile, office_landline, office_address, office_city,
 *   account_title, account_number, iban_number, branch_code, branch_name, bank_name,
 *   company_id, del, dt
 * }
 */
const createRealtorProfile = async (req, res) => {
  try {
    const b = req.body || {};

    // Minimal required validation (tighten with your Zod schema if available)
    const required = ['full_name', 'dob', 'cnic', 'mobile', 'nationality', 'filer_status', 'dt'];
    for (const k of required) {
      if (!b[k]) {
        return res.status(400).json({ success: false, message: `Field "${k}" is required` });
      }
    }

    const sql = `
      INSERT INTO business_profiles (
        full_name, relation_type, guardian_name, gender, dob, cnic, mobile, email,
        address, city, nationality, ntn, filer_status, reference, authorized_partner, partner_cnic,
        office_name, office_mobile, office_landline, office_address, office_city,
        account_title, account_number, iban_number, branch_code, branch_name, bank_name,
        company_id, del, dt, created_at, updated_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, NOW(), NOW())
    `;

    const params = [
      b.full_name ?? null,
      b.relation_type ?? null,
      b.guardian_name ?? null,
      b.gender ?? null,
      b.dob ?? null,
      b.cnic ?? null,
      b.mobile ?? null,
      b.email ?? null,

      b.address ?? null,
      b.city ?? null,
      b.nationality ?? null,
      b.ntn ?? null,
      b.filer_status ?? null,
      b.reference ?? null,
      b.authorized_partner ?? null,
      b.partner_cnic ?? null,

      b.office_name ?? null,
      b.office_mobile ?? null,
      b.office_landline ?? null,
      b.office_address ?? null,
      b.office_city ?? null,

      b.account_title ?? null,
      b.account_number ?? null,
      b.iban_number ?? null,
      b.branch_code ?? null,
      b.branch_name ?? null,
      b.bank_name ?? null,

      b.company_id ?? null,
      b.del ?? 'N',
      b.dt ?? Math.floor(Date.now() / 1000).toString(),
    ];

    const result = await dbQuery(sql, params);
    return res.status(200).json({ success: true, message: 'Profile created', id: result.insertId });
  } catch (error) {
    console.error('createRealtorProfile error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

/**
 * PUT /business-profiles/:id
 * Body: any subset of columns to update
 */
const updateRealtorProfile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'id (param) is required' });

    const allowed = [
      'full_name', 'relation_type', 'guardian_name', 'gender', 'dob', 'cnic', 'mobile', 'email',
      'address', 'city', 'nationality', 'ntn', 'filer_status', 'reference', 'authorized_partner', 'partner_cnic',
      'office_name', 'office_mobile', 'office_landline', 'office_address', 'office_city',
      'account_title', 'account_number', 'iban_number', 'branch_code', 'branch_name', 'bank_name',
      'company_id', 'del', 'dt'
    ];

    const body = req.body || {};
    const fields = [];
    const values = [];

    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        fields.push(`${key} = ?`);
        values.push(body[key] ?? null);
      }
    }

    if (!fields.length) {
      return res.status(400).json({ success: false, message: 'No valid fields provided to update' });
    }

    const sql = `UPDATE business_profiles SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    values.push(id);

    const result = await dbQuery(sql, values);
    return res.status(200).json({ success: true, message: 'Profile updated', affectedRows: result.affectedRows });
  } catch (error) {
    console.error('updateRealtorProfile error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

/**
 * DELETE /business-profiles/:id
 * Hard delete by default. For soft delete, see commented line.
 */
const deleteRealtorProfile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'id (param) is required' });

    // HARD DELETE:
    const sql = `DELETE FROM business_profiles WHERE id = ?`;
    const result = await dbQuery(sql, [id]);

    // SOFT DELETE (alternative):
    // const sql = `UPDATE business_profiles SET del = 'Y', updated_at = NOW() WHERE id = ?`;
    // const result = await dbQuery(sql, [id]);

    return res.status(200).json({ success: true, message: 'Profile deleted', affectedRows: result.affectedRows });
  } catch (error) {
    console.error('deleteRealtorProfile error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

/**
 * GET /business-profiles/:id
 */
const getRealtorProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'id (param) is required' });

    const sql = `SELECT * FROM business_profiles WHERE id = ? LIMIT 1`;
    const rows = await dbQuery(sql, [id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    return res.status(200).json({ success: true, message: 'Profile fetched', data: rows[0] });
  } catch (error) {
    console.error('getRealtorProfileById error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

/**
 * GET /business-profiles
 * Optional query: ?q=keyword&limit=20&offset=0
 * q searches across a few text columns.
 */
const getAllRealtorProfiles = async (req, res) => {
  try {
    const { q, limit = 50, offset = 0 } = req.query;

    let sql = `SELECT * FROM business_profiles WHERE 1=1`;
    const params = [];

    if (q) {
      sql += `
        AND (
          full_name LIKE ? OR cnic LIKE ? OR mobile LIKE ? OR email LIKE ?
          OR city LIKE ? OR office_name LIKE ? OR bank_name LIKE ?
        )
      `;
      const like = `%${q}%`;
      params.push(like, like, like, like, like, like, like);
    }

    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const rows = await dbQuery(sql, params);
    return res.status(200).json({ success: true, message: 'Profiles fetched', data: rows });
  } catch (error) {
    console.error('getAllRealtorProfiles error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

/**
 * GET /business-profiles/company/:companyId
 * Optional query: ?q=keyword&limit=20&offset=0
 */
const getRealtorProfilesByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'companyId (param) is required' });
    }

    const { q, limit = 50, offset = 0 } = req.query;

    let sql = `SELECT * FROM business_profiles WHERE company_id = ?`;
    const params = [companyId];

    if (q) {
      sql += `
        AND (
          full_name LIKE ? OR cnic LIKE ? OR mobile LIKE ? OR email LIKE ?
          OR city LIKE ? OR office_name LIKE ? OR bank_name LIKE ?
        )
      `;
      const like = `%${q}%`;
      params.push(like, like, like, like, like, like, like);
    }

    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const rows = await dbQuery(sql, params);
    return res.status(200).json({ success: true, message: 'Company profiles fetched', data: rows });
  } catch (error) {
    console.error('getRealtorProfilesByCompany error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

module.exports = {
  createRealtorProfile,
  updateRealtorProfile,
  deleteRealtorProfile,
  getRealtorProfileById,
  getAllRealtorProfiles,
  getRealtorProfilesByCompany,
};
