const mysqlConnection = require('../../utils/database');

const All_labels = async (req, res) => {
  try {
    const { email } = req.params;
    let {company}=req.query;
    const [userRows] = await mysqlConnection.promise().query('SELECT user_type, name, company_id FROM users WHERE email=?', [email]);
    let { user_type, name,company_id } = userRows[0];

    let labelData = [];
    if(company){
      company_id=company;
    }

    try {
      // Use a connection pool to handle connections
      const [labelRows] = await mysqlConnection.promise().query('SELECT * FROM leads_labels');

      // Iterate through each label and fetch the corresponding leads count
      for (const office of labelRows) {
        let leadsRows;

        if (user_type === "admin" || user_type==="super_admin") {
          // For admin, fetch leads count without user restriction
          [leadsRows] = await mysqlConnection.promise().query('SELECT count(*) as total FROM leads_main WHERE leads_label=? AND FIND_IN_SET(company_id, ?) > 0', [office.id,company_id]);
          
        } else {
          // For non-admin, fetch leads count with user restriction
          [leadsRows] = await mysqlConnection.promise().query('SELECT count(*) as total FROM leads_main WHERE leads_label=? AND assigned_to=? AND FIND_IN_SET(company_id, ?) > 0', [office.id, name,company_id]);
          
        }

        const totalLeads = leadsRows[0].total;

        labelData.push({
          id: office.id,
          label: office.label,
          bg: office.bg,
          link: office.link,
          details: office.details,
          sort: office.sort,
          permission: office.permission,
          del: office.del,
          totalLeads: totalLeads,
        });
      }

      // Respond with label data array
      res.status(200).json({
        success: true,
        message: 'All labels fetched successfully',
        allLabels: labelData,
      });

    } catch (error) {
      console.error('Error fetching all labels:', error);
      res.status(500).json({
        success: false,
        message: 'Error in fetching all labels',
        error: error.message,
      });
    }

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Error in fetching user',
      error: error.message,
    });
  }
};



const All_labelsForMember = async (req, res) => {
  try {
    const { id } = req.params;

    const [userRows] = await mysqlConnection.promise().query('SELECT user_type, name, company_id FROM users WHERE id=?', [id]);
    let { user_type, name,company_id } = userRows[0];

    let labelData = [];

    try {
      // Use a connection pool to handle connections
      const [labelRows] = await mysqlConnection.promise().query('SELECT * FROM leads_labels');

      // Iterate through each label and fetch the corresponding leads count
      for (const office of labelRows) {
        let leadsRows;

        if (user_type === "admin" || user_type==="super_admin") {
          // For admin, fetch leads count without user restriction
          [leadsRows] = await mysqlConnection.promise().query('SELECT count(*) as total FROM leads_main WHERE leads_label=? AND FIND_IN_SET(company_id, ?) > 0', [office.id,company_id]);
          
        } else {
          // For non-admin, fetch leads count with user restriction
          [leadsRows] = await mysqlConnection.promise().query('SELECT count(*) as total FROM leads_main WHERE leads_label=? AND assigned_to=? AND FIND_IN_SET(company_id, ?) > 0', [office.id, name, company_id]);
          
        }

        const totalLeads = leadsRows[0].total;

        labelData.push({
          id: office.id,
          label: office.label,
          bg: office.bg,
          link: office.link,
          details: office.details,
          sort: office.sort,
          permission: office.permission,
          del: office.del,
          totalLeads: totalLeads,
        });
      }

      // Respond with label data array
      res.status(200).json({
        success: true,
        message: 'All labels fetched successfully',
        allLabels: labelData,
      });

    } catch (error) {
      console.error('Error fetching all labels:', error);
      res.status(500).json({
        success: false,
        message: 'Error in fetching all labels',
        error: error.message,
      });
    }

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Error in fetching user',
      error: error.message,
    });
  }
};


const userPermission = async (req, res) => {
  try {
    // Extract email from request
    const { email } = req.params;

    // Query to fetch user_type based on email from users table
    const [userRows, userFields] = await mysqlConnection.promise().query('SELECT user_type FROM users WHERE email = ?', [email]);

    // Extract user_type from the result
    const userType = userRows[0]?.user_type;

    // If user_type is found, query user_type permissions from users_types table
    if (userType) {
      const [rows, fields] = await mysqlConnection.promise().query('SELECT * FROM users_types WHERE type = ?', [userType]);

      // Extract permission_level from the result
      const permissionLevels = rows.map(type => type.permission_level);

      // Respond with permission levels
      res.status(200).json({
        success: true,
        message: 'User permissions fetched successfully',
        permission: permissionLevels,
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found or user_type is not defined',
      });
    }
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error in fetching user permissions',
      error: error.message,
    });
  }
};

  
  const TotalLead = async (req, res) => {
    try {
    const {email,company}=req.query;
    const [userRows] = await mysqlConnection.promise().query('SELECT user_type, name, company_id FROM users WHERE email=?', [email]);
    let {company_id } = userRows[0];
      // Pass user_type as an array to replace the placeholder
      let rows;
      let rows1;
      
      if(company){
        [rows]= await mysqlConnection.promise().query('SELECT count(*) as total FROM leads_main WHERE FIND_IN_SET(company_id, ?) > 0',[company]);
        [rows1] = await mysqlConnection.promise().query('SELECT COUNT(*) as T_Unassigned FROM leads_main WHERE status = \'un_assigned\' AND FIND_IN_SET(company_id, ?) > 0',[company]);
       }
       else{
         [rows]= await mysqlConnection.promise().query('SELECT count(*) as total FROM leads_main WHERE FIND_IN_SET(company_id, ?) > 0',[company_id]);
         [rows1] = await mysqlConnection.promise().query('SELECT COUNT(*) as T_Unassigned FROM leads_main WHERE status = \'un_assigned\' AND FIND_IN_SET(company_id, ?) > 0',[company_id]);  
       }
      // Extract names from the result

      const labelData = rows
      // Respond with office data array
      const totalUnassignedLeads = rows1[0].T_Unassigned;
      const totalLeads = rows[0].total;
  
      res.status(200).json({
        success: true,
        message: 'All leads fetched successfully',
        total: totalLeads,
        total_unsigned: totalUnassignedLeads,
      });
    } catch (error) {
      console.error('Error fetching all Leads:', error);
      res.status(500).json({
        success: false,
        message: 'Error in fetching all Leads',
        error: error.message,
      });
    }
  };



  const UnaginedLead = async (req, res) => {
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

  module.exports = { All_labels, userPermission,TotalLead,UnaginedLead,All_labelsForMember};