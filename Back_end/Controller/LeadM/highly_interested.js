
const mysqlConnection = require('../../utils/database');




const Highly_interested = async (req, res) => {
    try {
        // Execute the SQL query to count unassigned leads with 'open' status
        const [rows] = await mysqlConnection.promise().query('SELECT COUNT(*) as T_Unassigned FROM leads_main WHERE status = \'open\'');

        // Extract the total count from the result
        const totalUnassignedLeads = rows[0].T_Unassigned;
        console.log("the total un assinged lead is:",totalUnassignedLeads)
        // Respond with the total count of unassigned leads
        res.status(200).json({
            success: true,
            message: 'Total unassigned leads fetched successfully',
            total_unsigned: totalUnassignedLeads,
        });
    } catch (error) {
        console.error('Error fetching total unassigned leads:', error);
        res.status(500).json({
            success: false,
            message: 'Error in fetching total unassigned leads',
            error: error.message,
        });
    }
};
//befire the filter remove code

// const highly_interested_table = async (req, res) => {
//   try {
//     const { id } = req.params; 
//     const {field,email,company} = req.query;
//     let [perm]= await mysqlConnection.promise().query(`
//     SELECT ut.permission_level AS permission, u.name, u.company_id AS company_id
//     FROM users_types ut 
//     JOIN users u ON u.user_type = ut.type where u.email=?`,[email])
//     let company_id;
 
//     company_id=perm[0].company_id;
//     if(company && ((perm[0].permission)>9)){
      
//       company_id=company
//     }
//   let leads;
// if(parseFloat(perm[0].permission)>=9)
//   {  [leads] = await mysqlConnection.promise().query(`
//       SELECT
//         main.id,
//         customer.full_name AS customer_name,
//         customer.mobile AS mobile,
//         project.name AS project_name,
//         project.status AS project_status,
//         interested_in.unit AS interested_in,
//         main.status,
//         main.view_dt,
//         main.user,
//         main.assigned_on,
//         main.assigned_to,
//         label.label AS label,
//         company.title AS company_title,
//         label.bg AS bg_color,
//         main.last_updated
//       FROM
//         leads_main AS main
//       INNER JOIN
//         leads_customers AS customer ON main.customer = customer.id
//       INNER JOIN
//         lead_projects AS project ON main.project = project.id
//       INNER JOIN
//         leads_labels AS label ON main.leads_label = label.id
//       INNER JOIN
//         companies AS company ON FIND_IN_SET(company.id, main.company_id) > 0
//       INNER JOIN
//         inventory_type AS interested_in ON main.interested_in = interested_in.id
//       WHERE
//         main.${field} = ? AND FIND_IN_SET(main.company_id, ?) > 0
//       ORDER BY main.last_updated DESC
//     `, [id,company_id]);

//      if (id==12 && field==="leads_label"){
//      [leads] = await mysqlConnection.promise().query(`
//       SELECT
//         main.id,
//         customer.full_name AS customer_name,
//         customer.mobile AS mobile,
//         project.name AS project_name,
//         project.status AS project_status,
//         interested_in.unit AS interested_in,
//         main.status,
//         main.view_dt,
//         main.user,
//         main.assigned_on,
//         main.assigned_to,
//         label.label AS label,
//         company.title AS company_title,
//         label.bg AS bg_color,
//         main.last_updated
//       FROM
//         leads_main AS main
//       INNER JOIN
//         leads_customers AS customer ON main.customer = customer.id
//       INNER JOIN
//         lead_projects AS project ON main.project = project.id
//       INNER JOIN
//         leads_labels AS label ON main.leads_label = label.id
//       INNER JOIN
//         companies AS company ON FIND_IN_SET(company.id, main.company_id) > 0
//       INNER JOIN
//         inventory_type AS interested_in ON main.interested_in = interested_in.id
//       WHERE
//         main.status = \'un_assigned\' AND FIND_IN_SET(main.company_id, ?) > 0
//       ORDER BY main.last_updated DESC
//     `,[company_id]);
//      }
//      if (id==11 && field==="leads_label"){
//        [leads] = await mysqlConnection.promise().query(`
//       SELECT
//         main.id,
//         customer.full_name AS customer_name,
//         customer.mobile AS mobile,
//         project.name AS project_name,
//         project.status AS project_status,
//         interested_in.unit AS interested_in,
//         main.status,
//         main.view_dt,
//         main.user,
//         main.assigned_on,
//         main.assigned_to,
//         label.label AS label,
//         company.title AS company_title,
//         label.bg AS bg_color,
//         main.last_updated
//       FROM
//         leads_main AS main
//       INNER JOIN
//         leads_customers AS customer ON main.customer = customer.id
//       INNER JOIN
//         lead_projects AS project ON main.project = project.id
//       INNER JOIN
//         leads_labels AS label ON main.leads_label = label.id
//       INNER JOIN
//         companies AS company ON FIND_IN_SET(company.id, main.company_id) > 0
//       INNER JOIN
//         inventory_type AS interested_in ON main.interested_in = interested_in.id
//       WHERE FIND_IN_SET(main.company_id, ?) > 0
//       ORDER BY main.last_updated DESC
//       `,[company_id]
//     );
//      }
//     }
//     else{
//       [leads] = await mysqlConnection.promise().query(`
//       SELECT
//         main.id,
//         customer.full_name AS customer_name,
//         customer.mobile AS mobile,
//         project.name AS project_name,
//         project.status AS project_status,
//         interested_in.unit AS interested_in,
//         main.status,
//         main.view_dt,
//         main.assigned_on,
//         main.assigned_to,
//         main.user,
//         label.label AS label,
//         company.title AS company_title,
//         label.bg AS bg_color,
//         main.last_updated
//       FROM
//         leads_main AS main
//       INNER JOIN
//         leads_customers AS customer ON main.customer = customer.id
//       INNER JOIN
//         lead_projects AS project ON main.project = project.id
//       INNER JOIN
//         leads_labels AS label ON main.leads_label = label.id
//       INNER JOIN
//         inventory_type AS interested_in ON main.interested_in = interested_in.id
//       INNER JOIN
//         companies AS company ON FIND_IN_SET(company.id, main.company_id) > 0
//       WHERE
//       main.assigned_to = ? AND main.${field} = ? AND FIND_IN_SET(main.company_id, ?) > 0
//       ORDER BY main.last_updated DESC
//     `, [perm[0].name,id,company_id]);
//     }

//     if (!leads.length) {
//       return res.status(200).json({
//         success: true,
//         message: 'No leads found',
//       });
//     }
  
//     leads = leads.map(lead => ({
//         ...lead,
//         permission: perm[0].permission
//       }));
  
//     // Respond with all leads information
//     res.status(200).json({
//       success: true,
//       message: 'All mached labels information fetched successfully',
//       leads: leads,
//     });
//   } catch (error) {
//     console.error('Error fetching table leads labels information:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error in fetching label leads information',
//       error: error.message,
//     });
//   }
// };


// GET /api/.../highly_interested/:id?field=...&email=...&page=1&pageSize=500
// OR  /api/.../highly_interested/:id?field=...&email=...&all=true&chunkSize=500

const highly_interested_table = async (req, res) => {
  try {
    const rawId = req.params.id;
    const { field, email } = req.query;

    // allowlist
    const FIELD_MAP = {
      leads_label: '`main`.`leads_label`',
      project: '`main`.`project`',
      interested_in: '`main`.`interested_in`',
      status: '`main`.`status`',
      user: '`main`.`user`',
      assigned_to: '`main`.`assigned_to`',
    };
    if (!FIELD_MAP[field]) {
      return res.status(400).json({ success: false, message: 'Invalid field' });
    }

    // user / permission
    const [permRows] = await mysqlConnection.promise().query(
      `
      SELECT ut.permission_level AS permission, u.name
      FROM users_types ut
      JOIN users u ON u.user_type = ut.type
      WHERE u.email = ?
      LIMIT 1
      `,
      [email]
    );
    if (!permRows?.length) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const permission = Number(permRows[0].permission) || 0;
    const userName = permRows[0].name;

    // where conditions
    const where = [];
    const params = [];

    const isAllLeadsBucket = field === 'leads_label' && String(rawId) === '11';
    const isUnassignedBucket = field === 'leads_label' && String(rawId) === '12';

    const stringFields = new Set(['status', 'user', 'assigned_to']);
    const filterValue = stringFields.has(field) ? String(rawId) : Number(rawId);

    if (permission >= 9) {
      if (isAllLeadsBucket) {
        // no extra filter
      } else if (isUnassignedBucket) {
        where.push('(`main`.`status` = ? OR `main`.`assigned_to` IS NULL OR `main`.`assigned_to` = \'\')');
        params.push('un_assigned');
      } else {
        where.push(`${FIELD_MAP[field]} = ?`);
        params.push(filterValue);
      }
    } else {
      if (isUnassignedBucket) {
        return res.status(200).json({
          success: true, message: 'No leads found', leads: [], total: 0
        });
      }
      where.push('`main`.`assigned_to` = ?');
      params.push(userName);
      if (!isAllLeadsBucket) {
        where.push(`${FIELD_MAP[field]} = ?`);
        params.push(filterValue);
      }
    }

    // base query parts
    const baseFrom = `
      FROM leads_main AS main
      LEFT JOIN leads_customers AS customer  ON main.customer      = customer.id
      LEFT JOIN lead_projects   AS project   ON main.project       = project.id
      LEFT JOIN leads_labels    AS label     ON main.leads_label   = label.id
      LEFT JOIN inventory_type  AS interested_in ON main.interested_in = interested_in.id
    `;
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const orderBy = 'ORDER BY main.last_updated DESC, main.id DESC';

    // count query
    const [countRows] = await mysqlConnection.promise().query(
      `SELECT COUNT(*) AS total FROM leads_main AS main ${whereSql.replaceAll('`main`.', 'main.')}`,
      params
    );
    const total = Number(countRows?.[0]?.total || 0);

    if (total === 0) {
      return res.status(200).json({
        success: true, message: 'No leads found', leads: [], total
      });
    }

    // main data query (⚡️ no LIMIT applied)
    const sql = `
      SELECT
        main.id,
        customer.full_name      AS customer_name,
        customer.mobile         AS mobile,
        customer.city      AS city,
        project.name            AS project_name,
        project.status          AS project_status,
        interested_in.unit      AS interested_in,
       
        main.status,
        main.view_dt,
        main.user,
        main.assigned_on,
        main.assigned_to,
        label.label             AS label,
        label.bg                AS bg_color,
        main.last_updated,
        main.lead_pass
      ${baseFrom}
      ${whereSql}
      ${orderBy}
    `;

    const [rows] = await mysqlConnection.promise().query(sql, params);
    const leads = rows.map(r => ({ ...r, permission }));

    return res.status(200).json({
      success: true,
      message: 'All matched labels information fetched successfully',
      leads,
      total
    });
  } catch (error) {
    console.error('Error fetching table leads labels information:', error);
    return res.status(500).json({
      success: false,
      message: 'Error in fetching label leads information',
      error: error.message,
    });
  }
};




const SpecificTeamMemberLeads = async (req, res) => {
  try {
    const { id, id1 } = req.params;
    const field = req.query.field;
    
    // Get user information
    const [user] = await mysqlConnection.promise().query(
      `SELECT name FROM users WHERE id = ?`,
      [id1]
    );

    if (!user || !user.length) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    let leads;
    const baseQuery = `
      SELECT
        main.id,
        customer.full_name AS customer_name,
        customer.mobile AS mobile,
        project.name AS project_name,
        project.status AS project_status,
        interested_in.unit AS interested_in, 
        main.status,
        main.view_dt,
        main.user,
        main.last_updated,
        main.assigned_to,
        label.label AS label,
        label.bg AS bg_color
      FROM
        leads_main AS main
      INNER JOIN leads_customers AS customer ON main.customer = customer.id
      INNER JOIN lead_projects AS project ON main.project = project.id
      INNER JOIN leads_labels AS label ON main.leads_label = label.id
      INNER JOIN inventory_type AS interested_in ON main.interested_in = interested_in.id
    `;

    // Special cases for unassigned leads (id=12) and all leads (id=11)
    if (id == 12 && field === "leads_label") {
      [leads] = await mysqlConnection.promise().query(
        `${baseQuery} WHERE main.status = 'un_assigned'`
      );
    } 
    else if (id == 11 && field === "leads_label") {
      [leads] = await mysqlConnection.promise().query(baseQuery);
    } 
    else {
      // Default case - filter by assigned_to and leads_label
      [leads] = await mysqlConnection.promise().query(
        `${baseQuery} WHERE main.assigned_to = ? AND main.leads_label = ?`,
        [user[0].name, id]
      );
    }

    if (!leads.length) {
      return res.status(200).json({
        success: true,
        message: 'No leads found',
        leads: []
      });
    }

    res.status(200).json({
      success: true,
      message: 'Leads information fetched successfully',
      leads: leads,
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      message: 'Error in fetching leads information',
      error: error.message,
    });
  }
};

  const GetLeadFromId = async (req, res) => {
    try {
      const { id } = req.params;
      const [leads] = await mysqlConnection.promise().query(`
        SELECT
          main.id,
          customer.full_name AS customer_name,
          customer.email AS email,
          customer.mobile AS mobile,
          project.name AS project_name,
          project.status AS project_status,
          project.category AS category,
          interested_in.unit AS interested_in,
          main.id AS main_id,
          main.assigned_on,
          main.status,
          main.view_dt,
          main.campaign_name,
          main.campaign_type,
          main.assigned_to,
          main.campaign_type,
          main.investment_time,
          main.investment_budget,
          main.user,
          label.label AS label,
          label.bg AS bg_color,
          label.color AS color
        FROM
          leads_main AS main
        INNER JOIN
          leads_customers AS customer ON main.customer = customer.id
        LEFT JOIN
          lead_projects AS project ON main.project = project.id
        INNER JOIN
          leads_labels AS label ON main.leads_label = label.id
        LEFT JOIN
          inventory_type AS interested_in ON main.interested_in = interested_in.id
        WHERE main.id = ?;
      `, [id]);
  
      if (!leads.length) {
        return res.status(404).json({
          success: false,
          message: 'No leads found',
        });
      }
  
      // Respond with all leads information
      res.status(200).json({
        success: true,
        message: ' leads information fetched successfully',
        leads: leads,
      });
    } catch (error) {
      console.error('Error fetching leads information:', error);
      res.status(500).json({
        success: false,
        message: 'Error in fetching leads information',
        error: error.message,
      });
    }
  };
  
//All customer data
//The global var//
const AllCustomers = async (req, res) => {
  try {
    const email = req.params.user;
    
    // Query the user's information based on the email
    const [userRows] = await mysqlConnection.promise().query(
      'SELECT user_type, name FROM users WHERE email = ?', 
      [email]
    );
    
    if (!userRows.length) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const { user_type, name } = userRows[0];
    
    // Get user's permission level
    const [typeRows] = await mysqlConnection.promise().query(
      'SELECT permission_level FROM users_types WHERE type = ?', 
      [user_type]
    );
    
    const hasHighPermission = typeRows.some(row => row.permission_level > 8);

    if (hasHighPermission) {
      // For high permission users, fetch all customers without company filter
      const [leads] = await mysqlConnection.promise().query(`
        SELECT
            main.id,
            customer.full_name AS customer_name,
            customer.mobile AS mobile,
            project.name AS project_name,
            project.status AS project_status,
            interested_in.unit AS interested_in,
            customer.email AS email,
           
            customer.city AS city,
            customer.country AS country,
            main.status,
            main.view_dt,
            main.assigned_on,
            main.assigned_to,
            main.user,
            label.label AS label,
            label.bg AS bg_color
        FROM
            leads_customers AS customer
        LEFT JOIN
            leads_main AS main ON customer.id = main.customer
        LEFT JOIN
            lead_projects AS project ON main.project = project.id
        LEFT JOIN
            leads_labels AS label ON main.leads_label = label.id
        LEFT JOIN
            inventory_type AS interested_in ON main.interested_in = interested_in.id
      `);

      return res.status(200).json({
        success: true,
        message: leads.length ? 'All Customers information fetched successfully' : 'No customers found',
        leads: leads,
      });
    }
  
    // For regular users, fetch only their assigned customers
    const [assignedCustomers] = await mysqlConnection.promise().query(
      'SELECT customer AS customer_id FROM leads_main WHERE assigned_to = ?',
      [name]
    );
    
    if (!assignedCustomers.length) {
      return res.status(200).json({
        success: true,
        message: 'No customers found',
        leads: [],
      });
    }

  let customerIds = assignedCustomers.map(c => c.customer_id);

// (optional) dedupe + ensure numbers
customerIds = Array.from(new Set(
  customerIds.map(Number).filter(Number.isFinite)
));

let sql = `
  SELECT
    id,
    full_name AS customer_name,
    mobile,
    whatsapp,
    email,
    job_title,
    city,
    type,
    country,
    dt,
    user AS assigned_to
  FROM leads_customers
  WHERE `;

let params = [];

if (customerIds.length > 0) {
  sql += `(id IN (?) OR user = ?)`;
  params.push(customerIds, name);
} else {
  sql += `user = ?`;
  params.push(name);
}

const [customers] = await mysqlConnection.promise().query(sql, params);



    return res.status(200).json({
      success: true,
      message: 'Customer information fetched successfully',
      leads: customers,
    });
  } catch (error) {
    console.error('Error fetching related Customers information:', error);
    return res.status(500).json({
      success: false,
      message: 'Error in fetching related Customers information',
      error: error.message,
    });
  }
};
//label for header
const HeaderLabel = async (req, res) => {
  try {
    const { id } = req.params;
    const [leads] = await mysqlConnection.promise().query(`
    SELECT label from leads_labels where id = ?;
    `, [id]);

    if (!leads.length) {
      return res.status(404).json({
        success: false,
        message: 'No Header found',
      });
    }

    // Respond with all leads information
    res.status(200).json({
      success: true,
      message: 'Header label information fetched successfully',
      header: leads,
    });
  } catch (error) {
    console.error('Error fetching header label information:', error);
    res.status(500).json({
      success: false,
      message: 'Error in fetching header label information',
      error: error.message,
    });
  }
};


module.exports = {Highly_interested,highly_interested_table,GetLeadFromId,AllCustomers,HeaderLabel, SpecificTeamMemberLeads};