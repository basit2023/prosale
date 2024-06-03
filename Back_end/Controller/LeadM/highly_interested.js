
const mysqlConnection = require('../../utils/database');




const Highly_interested = async (req, res) => {
    try {
        // Execute the SQL query to count unassigned leads with 'open' status
        const [rows] = await mysqlConnection.promise().query('SELECT COUNT(*) as T_Unassigned FROM leads_main WHERE status = \'open\'');

        // Extract the total count from the result
        const totalUnassignedLeads = rows[0].T_Unassigned;

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

const highly_interested_table = async (req, res) => {
  try {
    const { id } = req.params; 
    const {field,email,company} = req.query;
    let [perm]= await mysqlConnection.promise().query(`
    SELECT ut.permission_level AS permission, u.name, u.company_id AS company_id
    FROM users_types ut 
    JOIN users u ON u.user_type = ut.type where u.email=?`,[email])
    let company_id;
    console.log("the result!",company)
    company_id=perm[0].company_id;
    if(company && ((perm[0].permission)>9)){
      
      company_id=company
    }
  let leads;
if(parseFloat(perm[0].permission)>=9)
  {  [leads] = await mysqlConnection.promise().query(`
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
        label.label AS label,
        company.title AS company_title,
        label.bg AS bg_color
      FROM
        leads_main AS main
      INNER JOIN
        leads_customers AS customer ON main.customer = customer.id
      INNER JOIN
        lead_projects AS project ON main.project = project.id
      INNER JOIN
        leads_labels AS label ON main.leads_label = label.id
      INNER JOIN
        companies AS company ON FIND_IN_SET(company.id, main.company_id) > 0
      INNER JOIN
        inventory_type AS interested_in ON main.interested_in = interested_in.id
      WHERE
        main.${field} = ? AND FIND_IN_SET(main.company_id, ?) > 0
    `, [id,company_id]);

     if (id==12 && field==="leads_label"){
     [leads] = await mysqlConnection.promise().query(`
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
        label.label AS label,
        company.title AS company_title,
        label.bg AS bg_color
      FROM
        leads_main AS main
      INNER JOIN
        leads_customers AS customer ON main.customer = customer.id
      INNER JOIN
        lead_projects AS project ON main.project = project.id
      INNER JOIN
        leads_labels AS label ON main.leads_label = label.id
      INNER JOIN
        companies AS company ON FIND_IN_SET(company.id, main.company_id) > 0
      INNER JOIN
        inventory_type AS interested_in ON main.interested_in = interested_in.id
      WHERE
        main.status = \'un_assigned\' AND FIND_IN_SET(main.company_id, ?) > 0 ;
    `,[company_id]);
     }
     if (id==11 && field==="leads_label"){
       [leads] = await mysqlConnection.promise().query(`
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
        label.label AS label,
        company.title AS company_title,
        label.bg AS bg_color
      FROM
        leads_main AS main
      INNER JOIN
        leads_customers AS customer ON main.customer = customer.id
      INNER JOIN
        lead_projects AS project ON main.project = project.id
      INNER JOIN
        leads_labels AS label ON main.leads_label = label.id
      INNER JOIN
        companies AS company ON FIND_IN_SET(company.id, main.company_id) > 0
      INNER JOIN
        inventory_type AS interested_in ON main.interested_in = interested_in.id
      WHERE FIND_IN_SET(main.company_id, ?) > 0;
      `,[company_id]
    );
     }
    }
    else{
      [leads] = await mysqlConnection.promise().query(`
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
        label.label AS label,
        company.title AS company_title,
        label.bg AS bg_color
      FROM
        leads_main AS main
      INNER JOIN
        leads_customers AS customer ON main.customer = customer.id
      INNER JOIN
        lead_projects AS project ON main.project = project.id
      INNER JOIN
        leads_labels AS label ON main.leads_label = label.id
      INNER JOIN
        inventory_type AS interested_in ON main.interested_in = interested_in.id
      INNER JOIN
        companies AS company ON FIND_IN_SET(company.id, main.company_id) > 0
      WHERE
      main.assigned_to = ? AND main.${field} = ? AND FIND_IN_SET(main.company_id, ?) > 0;
      
    `, [perm[0].name,id,company_id]);
    }

    if (!leads.length) {
      return res.status(200).json({
        success: true,
        message: 'No leads found',
      });
    }
  
    leads = leads.map(lead => ({
        ...lead,
        permission: perm[0].permission
      }));
  
    // Respond with all leads information
    res.status(200).json({
      success: true,
      message: 'All mached labels information fetched successfully',
      leads: leads,
    });
  } catch (error) {
    console.error('Error fetching table leads labels information:', error);
    res.status(500).json({
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
    let user;
    [user]= await  mysqlConnection.promise().query(`Select name,company_id from users where id=?`,[id1])
    
    let leads;
    [leads] = await mysqlConnection.promise().query(`
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
        label.label AS label,
        label.bg AS bg_color,
        company.title AS company_title
      FROM
        leads_main AS main
      INNER JOIN
        leads_customers AS customer ON main.customer = customer.id
      INNER JOIN
        lead_projects AS project ON main.project = project.id
      INNER JOIN
        leads_labels AS label ON main.leads_label = label.id
      INNER JOIN
        companies AS company ON FIND_IN_SET(company.id, customer.company_id) > 0
      INNER JOIN
        inventory_type AS interested_in ON main.interested_in = interested_in.id
      WHERE
        main.assigned_to = ? AND main.leads_label = ? AND FIND_IN_SET(main.company_id, ?) > 0;
    `, [user[0].name, id,user[0].company_id]);


     if (id==12 && field==="leads_label"){
     [leads] = await mysqlConnection.promise().query(`
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
        label.label AS label,
        label.bg AS bg_color,
        company.title AS company_title
      FROM
        leads_main AS main
      INNER JOIN
        leads_customers AS customer ON main.customer = customer.id
      INNER JOIN
        lead_projects AS project ON main.project = project.id
      INNER JOIN
        leads_labels AS label ON main.leads_label = label.id
      INNER JOIN
        companies AS company ON FIND_IN_SET(company.id, customer.company_id) > 0
      INNER JOIN
        inventory_type AS interested_in ON main.interested_in = interested_in.id
      WHERE
        main.status = \'un_assigned\' AND FIND_IN_SET(main.company_id, ?) > 0;
    `[user[0].company_id]);
     }
     if (id==11 && field==="leads_label"){
       [leads] = await mysqlConnection.promise().query(`
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
        label.label AS label,
        label.bg AS bg_color,
        company.title AS company_title
      FROM
        leads_main AS main
      INNER JOIN
        leads_customers AS customer ON main.customer = customer.id
      INNER JOIN
        lead_projects AS project ON main.project = project.id
      INNER JOIN
        leads_labels AS label ON main.leads_label = label.id
      INNER JOIN
        companies AS company ON FIND_IN_SET(company.id, customer.company_id) > 0
      INNER JOIN
        inventory_type AS interested_in ON main.interested_in = interested_in.id
      WHERE FIND_IN_SET(main.company_id, ?) > 0
    `,[user[0].company_id]);
     }
    if (!leads.length) {
      return res.status(200).json({
        success: true,
        message: 'No leads found',
      });
    }

    // Respond with all leads information
    res.status(200).json({
      success: true,
      message: 'All mached labels information fetched successfully',
      leads: leads,
    });
  } catch (error) {
    console.error('Error fetching table leads labels information:', error);
    res.status(500).json({
      success: false,
      message: 'Error in fetching label leads information',
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
          main.investment_time,
          main.investment_budget,
          main.user,
          label.label AS label,
          label.bg AS bg_color
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
// 
const AllCustomers = async (req, res) => {
  try {
    const email = req.params.user;
    

    // Query the user's permission level based on the email
    const [userRows, userFields] = await mysqlConnection.promise().query('SELECT user_type, name, company_id FROM users WHERE email = ?', [email]);
    const {user_type, company_id,name} = userRows[0];
    
      const [rows, fields] = await mysqlConnection.promise().query('SELECT * FROM users_types WHERE type = ?', [user_type]);
      const permissionLevels = rows.map(type => type.permission_level);
   
      if (permissionLevels.some(level => level > 8)) {
        // Original query to fetch leads information
        const [leads] = await mysqlConnection.promise().query(`
          SELECT
              main.id,
              customer.full_name AS customer_name,
              customer.mobile AS mobile,
              project.name AS project_name,
              project.status AS project_status,
              interested_in.unit AS interested_in,
              customer.email AS email,
              customer.job_title AS job_title,
              customer.city AS city,
              customer.country AS country,
              main.status,
              main.view_dt,
              main.user,
              label.label AS label,
              label.bg AS bg_color,
              company.title AS company_title
          FROM
              leads_customers AS customer
          LEFT JOIN
              leads_main AS main ON customer.id = main.customer
          LEFT JOIN
              lead_projects AS project ON main.project = project.id
          LEFT JOIN
              leads_labels AS label ON main.leads_label = label.id
          INNER JOIN
              companies AS company ON FIND_IN_SET(company.id, customer.company_id) > 0
          LEFT JOIN
              inventory_type AS interested_in ON main.interested_in = interested_in.id
          WHERE
              FIND_IN_SET(customer.company_id, ?) > 0
      `, [company_id]);


        if (!leads.length) {
          return res.status(200).json({
            success: true,
            message: 'No cutomer found',
          });
        }

        // Respond with all leads information
        return res.status(200).json({
          success: true,
          message: 'All Customers information fetched successfully',
          leads: leads,
        });
      }
    
  
    // Fetch assigned customers based on the user's name
    const [assignedCustomers] = await mysqlConnection.promise().query('SELECT customer AS customer_id FROM leads_main WHERE assigned_to = ? AND FIND_IN_SET(company_id, ?) > 0', [name, company_id]);
    
    const customerIds = assignedCustomers.map(customer => customer.customer_id);
    
    const placeholders = customerIds.map(() => '?').join(',');
    if (!placeholders.length) {
      return res.status(200).json({
        success: true,
        message: 'No Customer found',
      });
    }

    if (!placeholders.length) {
      return res.status(200).json({
        success: true,
        message: 'No Customer found',
      });
    }
    
    const [customers] = await mysqlConnection.promise().query(
      `SELECT * FROM leads_customers WHERE id IN (${customerIds} AND FIND_IN_SET(company_id, ?) > 0) `,
      [...customerIds,company_id]
    );

    const adjustedCustomers = customers.map(customer => ({
      id: customer.id,
      customer_name: customer.full_name, // Change key here
      mobile: customer.mobile,
      whatsapp: customer.whatsapp,
      email: customer.email,
      job_title: customer.job_title,
      city: customer.city,
      type: customer.type,
      country: customer.country,
      dt: customer.dt,
      company_title:customer.company_title,
    }));
    // Respond with the fetched customer information
    res.status(200).json({
      success: true,
      message: 'Customer information fetched successfully',
      leads: adjustedCustomers,
    });
  } catch (error) {
    console.error('Error fetching related Customers information:', error);
    res.status(500).json({
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