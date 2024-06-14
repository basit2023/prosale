
const mysqlConnection = require('../../utils/database');

const ZoneData = async (req, res) => {
    try {
    // //   const { id } = req.params; 
       
       const {  table } = req.query;

  
      let leads;
      [leads] = await mysqlConnection.promise().query(`
      SELECT 
      CONCAT_WS(' ', TRIM(u.first_name), TRIM(u.last_name)) AS full_name,
      
      uz.title AS title,
      uz.id AS id,

      FROM 
        ${table} uz 
      JOIN 
        users u ON uz.${id} = u.id;
      `);
  
      if (!leads.length) {
        return res.status(200).json({
          success: true,
          message: 'No zones found',
        });
      }
  
      // Respond with all leads information
      res.status(200).json({
        success: true,
        message: 'All Zones information fetched successfully',
        leads: leads,
      });
    } catch (error) {
      console.error('Error fetching table zones information:', error);
      res.status(500).json({
        success: false,
        message: 'Error in fetching zones information',
        error: error.message,
      });
    }
  };
  const Getteamates = async (req, res) => {
    try {
      const { id } = req.params;
      const {email}=req.query;

      const [userRows] = await mysqlConnection.promise().query('SELECT user_type, name,company_id FROM users WHERE email = ?', [email]);
    
      
  
      
      const { company_id } = userRows[0];


      const [team] = await mysqlConnection.promise().query(
        `SELECT 
          CONCAT(u.first_name, ' ', u.last_name) AS full_name,
          u.id AS id,
          u.company_id,
          u.mobile AS number,
          u.email AS email,
          u.designation AS designation,
          u.name,
          ut.title,
          ut.zone_id,
          ut.manager_id,
          CONCAT(manager.first_name, ' ', manager.last_name) AS manager_full_name
        FROM 
          users_teams ut
        JOIN 
          users u ON ut.id = u.assigned_team
        INNER JOIN
          users manager ON ut.manager_id = manager.id
        WHERE 
        FIND_IN_SET(ut.manager_id , ?) > 0 AND FIND_IN_SET(u.company_id, ?) > 0`, [id, company_id]
      );
  
      if (!team.length) {
        return res.status(404).json({
          success: false,
          message: 'No team members found for the provided ID',
        });
      }
  
      // Query to count total leads for each team member
      const totalLeadsPromises = team.map(async (member) => {
        const [totalLeads] = await mysqlConnection.promise().query(
          `SELECT COUNT(*) AS total_lead_count 
          FROM leads_main 
          WHERE assigned_to = ? AND FIND_IN_SET(company_id, ?) > 0`,
          [member.name,company_id]
        );
        return { ...member, total_lead_count: totalLeads[0].total_lead_count };
      });
  
      // Query to count unread leads for each team member
      const unreadLeadsPromises = team.map(async (member) => {
        const [unreadLeads] = await mysqlConnection.promise().query(
          `SELECT COUNT(*) AS unread_lead_count
          FROM leads_main 
          WHERE view_dt = "new_lead" AND assigned_to = ? AND FIND_IN_SET(company_id, ?) > 0`,
          [member.name, company_id]
        );
        return { ...member, unread_lead_count: unreadLeads[0].unread_lead_count };
      });
  
      // Execute all promises concurrently
      const totalLeadsCounts = await Promise.all(totalLeadsPromises);
      const unreadLeadsCounts = await Promise.all(unreadLeadsPromises);
  
      // Combine the results of both sets of queries
      const teamWithCounts = team.map((member) => {
        const totalLeadCount = totalLeadsCounts.find((count) => count.id === member.id)?.total_lead_count ?? 0;
        const unreadLeadCount = unreadLeadsCounts.find((count) => count.id === member.id)?.unread_lead_count ?? 0;
        return { ...member, total_lead_count: totalLeadCount, unread_lead_count: unreadLeadCount };
      });
  
      // Respond with user information including lead count
      res.status(200).json({
        success: true,
        message: 'Team members data fetched successfully',
        team: teamWithCounts,
      });
    } catch (error) {
      console.error('Error fetching Team Members info:', error);
      res.status(500).json({
        success: false,
        message: 'Error in fetching Team Members info',
        error: error.message,
      });
    }
  };
  



  const GetteamName = async (req, res) => {
    try {
      const { id } = req.params;

      const [team] = await mysqlConnection.promise().query(
        `SELECT 
        CONCAT(u.first_name, ' ', u.last_name) AS full_name,
        u.id AS id,
        u.mobile AS number,
        u.email AS email,
        u.designation AS designation,
        u.name,
        ut.title,
        ut.zone_id,
        ut.manager_id,
        CONCAT(manager.first_name, ' ', manager.last_name) AS manager_full_name
        FROM 
            users_teams ut
        JOIN 
            users u ON ut.id = u.assigned_team
        INNER JOIN
            users manager ON ut.manager_id = manager.id
        WHERE 
            ut.manager_id = ?`, [id]
      );
  
      if (!team.length) {
        return res.status(404).json({
          success: false,
          message: 'No team members found for the provided ID',
        });
      }
  
      // Respond with user information
      res.status(200).json({
        success: true,
        message: 'Team members data fetched successfully',
        team: team
      });
    } catch (error) {
      console.error('Error fetching Team Members info:', error);
      res.status(500).json({
        success: false,
        message: 'Error in fetching Team Members info',
        error: error.message,
      });
    }
  };
  


  //get team for new Employee
  const TeamForEmployee = async (req, res) => {
    try {
        // Use a connection pool to handle connections
        const [rows, fields] = await mysqlConnection.promise().query(`SELECT id, title FROM users_teams`);

        const data = rows.map(row => ({
          name: row.title,
          value: row.id
      }));

        res.status(200).json({
            success: true,
            message: 'teams data fetched successfully',
            data: data,
        });
    } catch (error) {
        console.error('Error fetching teams data:', error);
        res.status(500).json({
            success: false,
            message: 'Error in fetching teams data',
            error: error.message,
        });
    }
};
// update team for employee

//update team and zones
const UpdateTeamForEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID',
      });
    }

    // Extract fields from the request body
    const { assigned_team, user, dt } = req.body;

    let sql = `UPDATE users SET `;
    const values = [];
    const name=user;
    // Determine which fields to include based on the table name
    if (name !== undefined && name !== '') {
      sql += 'name = ?, ';
      values.push(name);
    }
    if (dt !== undefined && dt !== '') {
      sql += 'dt = ?, '; 
      values.push(dt);
    }
    if (assigned_team !== undefined && assigned_team !== '') {
      sql += 'assigned_team = ?, ';
      values.push(assigned_team);
    }

    // Remove the trailing comma and space
    sql = sql.slice(0, -2) + ' WHERE id = ?';
    values.push(id);

    // Execute the query
    const [result] = await mysqlConnection.promise().query(sql, values);

    res.status(200).json({
      success: true,
      message: `User data updated successfully`,
    });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({
      success: false,
      message: `Error in updating user data`,
      error: error.message,
    });
  }
};







const AddTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'No Manager Found',
      });
    }

    // Extract fields from the request body
    const { member } = req.body;

    // Query to get the team id from users_teams table
    const [team] = await mysqlConnection.promise().query(
      `SELECT id FROM users_teams WHERE manager_id = ?`, [id]
    );

    if (!team[0] || !team[0].id) {
      return res.status(400).json({
        success: false,
        message: 'No team found for the given manager',
      });
    }

    const teamId = team[0].id;

    // Update query to assign the team to the user
    const [result] = await mysqlConnection.promise().query(
      `UPDATE users SET assigned_team = ? WHERE id = ?`, [teamId, member]
    );

    res.status(200).json({
      success: true,
      message: `New Member successfully added to Team`,
    });
  } catch (error) {
    console.error('Error in adding New Member to team:', error);
    res.status(500).json({
      success: false,
      message: `Error in adding New Member to team`,
      error: error.message,
    });
  }
};





  module.exports = { Getteamates, TeamForEmployee,UpdateTeamForEmployee,AddTeamMember };
  