
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
    const { id } = req.params;            // may be a comma list of manager ids
    const { email, dt } = req.query;      // optional: dt = 'YYYY-MM-DD'

    // sanity: user exists (you only need this if you rely on the email for auth)
    const [userRows] = await mysqlConnection.promise().query(
      'SELECT user_type, name FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    if (!userRows?.length) {
      return res.status(404).json({ success: false, message: 'User not found for email' });
    }

    // fresh date (default = today in server TZ)
    const freshDate = (dt && /^\d{4}-\d{2}-\d{2}$/.test(dt)) ? dt : new Date().toISOString().slice(0, 10);
    const freshStart = `${freshDate} 00:00:00`;
    const freshEnd   = `${freshDate} 23:59:59`;

    // resolve THE manager's name (for manager_lead_count)
    const firstManagerId = String(id).split(',')[0];
    const [mgrRows] = await mysqlConnection.promise().query(
      'SELECT name FROM users WHERE id = ? LIMIT 1',
      [firstManagerId]
    );
    const managerAssigneeName = mgrRows?.[0]?.name ?? null;

    // team list: filter by the manager ids provided
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
            users u ON ut.id = u.assigned_team || u.id=?
        INNER JOIN
            users manager ON ut.manager_id = manager.id
        WHERE 
            ut.manager_id = ? ` , [id,id]
      );

    if (!team.length) {
      return res.status(404).json({ success: false, message: 'No team members found for the provided ID' });
    }

    // total leads per teammate (no company filter)
    const totalLeadsPromises = team.map(async (member) => {
      const [rows] = await mysqlConnection.promise().query(
        `SELECT COUNT(*) AS total_lead_count
           FROM leads_main
          WHERE assigned_to = ?`,
        [member.name]
      );
      return { id: member.id, total_lead_count: rows[0].total_lead_count };
    });

    // unread leads per teammate
    const unreadLeadsPromises = team.map(async (member) => {
      const [rows] = await mysqlConnection.promise().query(
        `SELECT COUNT(*) AS unread_lead_count
           FROM leads_main
          WHERE view_dt = "new_lead"
            AND assigned_to = ?`,
        [member.name]
      );
      return { id: member.id, unread_lead_count: rows[0].unread_lead_count };
    });

    // fresh (today or ?dt) leads per teammate — use range for index
    const freshLeadsPromises = team.map(async (member) => {
      const [rows] = await mysqlConnection.promise().query(
        `SELECT COUNT(*) AS fresh_lead_count
           FROM leads_main
          WHERE assigned_to = ?
            AND dt >= ? AND dt <= ?`,
        [member.name, freshStart, freshEnd]
      );
      return { id: member.id, fresh_lead_count: rows[0].fresh_lead_count };
    });

    // manager_lead_count — same number for all teammates
    let managerLeadCount = 0;
    if (managerAssigneeName) {
      const [rows] = await mysqlConnection.promise().query(
        `SELECT COUNT(*) AS manager_lead_count
           FROM leads_main
          WHERE assigned_to = ?`,
        [managerAssigneeName]
      );
      managerLeadCount = rows[0].manager_lead_count;
    }

    const [totalLeadsCounts, unreadLeadsCounts, freshLeadsCounts] = await Promise.all([
      Promise.all(totalLeadsPromises),
      Promise.all(unreadLeadsPromises),
      Promise.all(freshLeadsPromises),
    ]);

    const teamWithCounts = team.map((member) => {
      const totalLeadCount  = totalLeadsCounts.find(x => x.id === member.id)?.total_lead_count ?? 0;
      const unreadLeadCount = unreadLeadsCounts.find(x => x.id === member.id)?.unread_lead_count ?? 0;
      const freshLeadCount  = freshLeadsCounts.find(x => x.id === member.id)?.fresh_lead_count ?? 0;

      return {
        ...member,
        total_lead_count: totalLeadCount,
        unread_lead_count: unreadLeadCount,
        fresh_lead_count: freshLeadCount,
        manager_lead_count: managerLeadCount,
        fresh_date: freshDate,
      };
    });

    res.status(200).json({
      success: true,
      message: 'Team members data fetched successfully',
      team: teamWithCounts,
    });
  } catch (error) {
    console.error('Error fetching Team Members info:', error);
    res.status(500).json({ success: false, message: 'Error in fetching Team Members info', error: error.message });
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
            ut.manager_id = ? || u.id=?` , [id,id]
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


const GetSpecificteam = async (req, res) => {
  try {
    const { id } = req.query;
    
    // Validate the ID parameter
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid team ID provided',
      });
    }

    // First, get the team details, manager info, and zone info
    const [teamRows] = await mysqlConnection.promise().query(`
      SELECT 
        ut.title AS team_title,
        uz.title AS zone_title,
        CONCAT(u.first_name, ' ', u.last_name) AS manager_name,
        ut.project_id
      FROM users_teams ut
      JOIN users u ON ut.manager_id = u.id
      JOIN users_zones uz ON ut.zone_id = uz.id
      WHERE ut.id = ? AND ut.del = "N"
    `, [id]);

    // Check if team was found
    if (!teamRows || teamRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    const teamData = teamRows[0];
    
    // If there are projects, get their names
    let projects = [];
    if (teamData.project_id) {
      // Use FIND_IN_SET for comma-separated values
      const [projectRows] = await mysqlConnection.promise().query(`
        SELECT id, name 
        FROM lead_projects
        WHERE FIND_IN_SET(id, ?) AND del = "N"
      `, [teamData.project_id]);
      
      projects = projectRows;
    }

    // Prepare the response data
    const responseData = {
      title: teamData.team_title,
      zone_title: teamData.zone_title,  // Added zone title to response
      manager_name: teamData.manager_name,
      projects: projects
    };

    // Return the data
    res.status(200).json({
      success: true,
      message: 'Data fetched successfully', 
      data: responseData,    
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({
      success: false,
      message: 'Error in fetching data',
      error: error.message,
    });
  }
};


  module.exports = { Getteamates, TeamForEmployee,UpdateTeamForEmployee,AddTeamMember,GetSpecificteam };
  