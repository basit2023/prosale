
const mysqlConnection = require('../../utils/database');

const ZoneData = async (req, res) => {
  try {
    const { email } = req.params;
    const { id, table, managerType } = req.query;

    // Fetch user permission level
    const [userPermissionLevel] = await mysqlConnection.promise().query(
      `SELECT u.id, u.user_type, u.company_id, ut.permission_level, ut.Edit_permission, ut.View_permission
      FROM users u
      JOIN users_types ut ON u.user_type = ut.type
      WHERE u.email = ?;`, 
      [email]
    );
   
    if (!userPermissionLevel || !userPermissionLevel.length) {
      return res.status(404).json({
        success: false,
        message: 'User not found or permission level not available',
      });
    }

    const userPermissionData = userPermissionLevel[0];
    const user_id = userPermissionData.id;
    const userPermission = userPermissionData.permission_level;
    const userEditPermission = userPermissionData.Edit_permission;
    const userViewPermission = userPermissionData.View_permission;
    const {company_id}=userPermissionLevel[0];

    let dynamicField = '';
    if (managerType === 'zonal') {
      dynamicField = 'uz.zonal_manager AS zonal_manager';
    } else if (managerType === 'manager') {
      dynamicField = 'uz.manager_id AS manager_id';
    }

    let leads;
    if (userPermission >= 9) {
      [leads] = await mysqlConnection.promise().query(`
      SELECT 
          CONCAT_WS(' ', TRIM(u.first_name), TRIM(u.last_name)) AS full_name,
          uz.title AS title,
          uz.id AS id,
          MAX(company.title) AS company_title,
          ${dynamicField},
          COUNT(ut.zone_id) AS Zone_Teams
      FROM 
          ${table} uz
      INNER JOIN
          users_teams ut ON uz.id = ut.zone_id
      INNER JOIN 
          users u ON uz.${id} = u.id
      INNER JOIN
          companies AS company ON FIND_IN_SET(company.id, u.company_id) > 0
      WHERE 
          FIND_IN_SET(u.company_id, ?) > 0
      GROUP BY
          uz.id;
      `,[company_id]);
    } else {
      [leads] = await mysqlConnection.promise().query(`
        SELECT 
          CONCAT_WS(' ', TRIM(u.first_name), TRIM(u.last_name)) AS full_name,
          uz.title AS title,
          uz.id AS id,
          MAX(company.title) AS company_title,
          uz.zonal_manager AS zonal_manager,
          COUNT(ut.zone_id) AS Zone_Teams

        FROM 
          users_zones uz
        INNER JOIN
          users_teams ut ON uz.id = ut.zone_id
        INNER JOIN 
          users u ON uz.zonal_manager = u.id 
        INNER JOIN
          companies AS company ON FIND_IN_SET(company.id, u.company_id) > 0
        WHERE 
          FIND_IN_SET(u.company_id, ?) > 0 AND uz.zonal_manager = ?
        GROUP BY
          uz.id;
      `, [ company_id, user_id]);
    }

    if (!leads.length) {
      return res.status(200).json({
        success: true,
        message: 'No zones found',
      });
    }

    // Add user permissions to each lead object
    const leadsWithPermissions = leads.map((lead) => ({
      ...lead,
      userPermissions: {
        Edit_permission: userEditPermission,
        View_permission: userViewPermission,
      },
    }));

    // Respond with all leads information along with user permissions
    res.status(200).json({
      success: true,
      message: 'All Zones information fetched successfully',
      leads: leadsWithPermissions,
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


const TeamData = async (req, res) => {
  try {
    const { email } = req.params;
    const { id, table, managerType } = req.query;

    // Fetch user permission level
    const [userData] = await mysqlConnection.promise().query(`
      SELECT u.id, u.user_type, u.company_id, ut.permission_level, ut.Edit_permission, ut.View_permission
      FROM users u
      INNER JOIN users_types ut ON u.user_type = ut.type
      WHERE u.email = ?;
    `, [email]);

    if (!userData || !userData.length) {
      return res.status(404).json({
        success: false,
        message: 'User not found or permission level not available',
      });
    }

    const userPermissionLevel = userData[0].permission_level;
    const userEditPermission = userData[0].Edit_permission;
    const userViewPermission = userData[0].View_permission;
    const userId = userData[0].id;
    const company_id=userData[0].company_id;

    let dynamicField = '';
    if (managerType === 'zonal') {
      dynamicField = 'uz.zonal_manager AS zonal_manager';
    } else if (managerType === 'manager') {
      dynamicField = 'uz.manager_id AS manager_id';
    }

    let leads;
    if (userPermissionLevel >= 9) {
      [leads] = await mysqlConnection.promise().query(`
        SELECT 
          CONCAT_WS(' ', TRIM(u.first_name), TRIM(u.last_name)) AS full_name,
          tz.title AS zone_title,
          uz.title AS title,
          uz.id AS id,
          company.title AS company_title,
          uz.manager_id AS manager_id
        FROM 
          ${table} uz
        INNER JOIN 
          users u ON uz.${id} = u.id 
        INNER JOIN
          companies AS company ON FIND_IN_SET(company.id, u.company_id) > 0
        INNER JOIN 
          users_zones tz ON uz.zone_id = tz.id

          where FIND_IN_SET(u.company_id, ?) > 0;
      `,[company_id]);
    } else {
      [leads] = await mysqlConnection.promise().query(`
        SELECT 
          CONCAT_WS(' ', TRIM(u.first_name), TRIM(u.last_name)) AS full_name,
          tz.title AS zone_title,
          uz.title AS title,
          uz.id AS id,
          company.title AS company_title,
          uz.manager_id AS manager_id
        FROM 
          ${table} uz
        INNER JOIN 
          users u ON uz.${id} = u.id
        INNER JOIN
          companies AS company ON FIND_IN_SET(company.id, u.company_id) > 0
        INNER JOIN 
          users_zones tz ON uz.zone_id = tz.id
        WHERE 
        FIND_IN_SET(u.company_id, ?) > 0 AND u.id IN (SELECT manager_id FROM users_teams WHERE manager_id = ?);
      `, [company_id, userId]);
    }

    if (!leads.length) {
      return res.status(200).json({
        success: true,
        message: 'No zones found',
      });
    }

    // Get total team members count for each lead
    const leadsWithTotalMembers = await Promise.all(leads.map(async (lead) => {
      const managerId = lead.manager_id;
      const [totalTeamMembers] = await mysqlConnection.promise().query(`
        SELECT 
          COUNT(*) AS total_team_members
        FROM 
          users u
        JOIN 
          users_teams ut ON u.assigned_team = ut.id
        WHERE 
          ut.manager_id = ? AND FIND_IN_SET(u.company_id, ?) > 0;
      `, [managerId,company_id]);

      return {
        ...lead,
        total_members: totalTeamMembers[0].total_team_members,
      };
    }));

    // Map permissions to leads
    const leadsWithPermissions = leadsWithTotalMembers.map((lead) => ({
      ...lead,
      userPermissions: {
        Edit_permission: userEditPermission,
        View_permission: userViewPermission,
      },
    }));

    // Respond with all leads information along with user permissions
    res.status(200).json({
      success: true,
      message: 'All Zones information fetched successfully',
      leads: leadsWithPermissions,
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


//get the one zone all teams
const ZoneTeamData = async (req, res) => {
  try {
    const { table, managerType,email } = req.query;
    const {id}=req.params;
    const [userRows] = await mysqlConnection.promise().query('SELECT user_type, name,company_id FROM users WHERE email = ?', [email]);
    const {company_id}=userRows[0]
    console.log("the company id is:",userRows[0])
    console.log("the company id is:",company_id)
    const [userTeams] = await mysqlConnection.promise().query(`
      SELECT DISTINCT manager_id AS id2
      FROM users_teams
      WHERE zone_id = ?;
    `, [id]);

    if (!userTeams.length) {
      return res.status(200).json({
        success: true,
        message: 'No Team Assigned',
      });
    }
    const {id2} = userTeams[0]//.map(team => team.id2);
    
    let dynamicField = '';
    if (managerType === 'zonal') {
      dynamicField = 'uz.zonal_manager AS zonal_manager';
    } else if (managerType === 'manager') {
      dynamicField = 'uz.manager_id AS manager_id';
    }

    let leads;
    [leads] = await mysqlConnection.promise().query(`
      SELECT 
        CONCAT_WS(' ', TRIM(u.first_name), TRIM(u.last_name)) AS full_name,
        tz.title AS zone_title,
        uz.title AS title,
        uz.id AS id,
        company.title AS company_title,
        uz.manager_id AS manager_id
      FROM 
        ${table} uz
      JOIN 
        users u ON uz.manager_id=u.id
      JOIN 
        users_zones tz ON uz.zone_id = tz.id
      INNER JOIN
        companies AS company ON FIND_IN_SET(company.id, u.company_id) > 0
      WHERE
        FIND_IN_SET(u.company_id, ?) > 0 AND FIND_IN_SET(uz.manager_id, ?) > 0;
    `, [company_id, id2]);

 // ${id2.map(id => `uz.${id} = u.id`).join(' OR ')}
    if (!leads.length) {
      return res.status(200).json({
        success: true,
        message: 'No zones found',
      });
    }

    // Get total team members count for each lead
    const leadsWithTotalMembers = await Promise.all(leads.map(async (lead) => {
      const managerId = lead.manager_id;
      const [totalTeamMembers] = await mysqlConnection.promise().query(`
        SELECT 
          COUNT(*) AS total_team_members
        FROM 
          users u 
        INNER JOIN 
          users_teams ut ON u.assigned_team = ut.id
        WHERE 
          FIND_IN_SET(u.company_id, ?) > 0 AND FIND_IN_SET(ut.manager_id, ?) > 0;
      `, [company_id, managerId]);

      return {
        ...lead,
        total_members: totalTeamMembers[0].total_team_members,
      };
    }));

    // Respond with all leads information
    res.status(200).json({
      success: true,
      message: 'All Zones information fetched successfully',
      leads: leadsWithTotalMembers,
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


  const GetzoneMemeber = async (req, res) => {
    try {
        // Use a connection pool to handle connections
        const [rows, fields] = await mysqlConnection.promise().query(`
        SELECT uz.id,title, CONCAT(u.first_name, ' ', u.last_name) AS full_name
          FROM users_zones uz
          JOIN users u ON uz.zonal_manager = u.id;
        `);

        const data = rows.map(row => ({
          name: row.title,
          value: row.id
      }));

        res.status(200).json({
            success: true,
            message: 'Data fetched successfully', 
            data: data,    
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
  const GetTeamMemeber = async (req, res) => {
    try {
        // Use a connection pool to handle connections
        const {email,table}=req.query;
        console.log("the table is:",table,email)
        const [user] = await mysqlConnection.promise().query('SELECT company_id from users where email=?',[email])
        let rows;
        if(table=='footer'){
         [rows, fields] = await mysqlConnection.promise().query(`SELECT id, CONCAT_WS(' ', TRIM(first_name), TRIM(last_name)) AS full_name 
          FROM users 
          WHERE FIND_IN_SET(company_id, ?) > 0`,[user[0].company_id]);
        }else{
         [rows, fields] = await mysqlConnection.promise().query(`SELECT id, CONCAT_WS(' ', TRIM(first_name), TRIM(last_name)) AS full_name 
           FROM users 
            WHERE COALESCE(assigned_team, '') = '' OR assigned_team IS NULL AND FIND_IN_SET(company_id, ?) > 0`,[user[0].company_id]);
        }
        const data = rows.map(row => ({
          name: row.full_name,
          value: row.id
      }));

        res.status(200).json({
            success: true,
            message: 'Data fetched successfully',
            data: data,
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
  


const getSpecificteamZone = async (req, res) => {
  try {
    const { id } = req.params; 
    const { table } = req.query;
    const [user] = await mysqlConnection.promise().query('SELECT * FROM leads_customers WHERE id = ?', [id]);

    if (!user.length) {
      return res.status(404).json({
        success: false,
        message: 'Id is not defined',
      });
    }

    // Respond with user information
    res.status(200).json({
      success: true,
      message: 'Team Zone data fetched successfully',
      user: {
        id: user[0].id,
        title: user[0].title,
        zonal_manager: user[0].zonal_manager,
        zone_id: user[0].zone_id,
        manager_id: user[0].manager_id,
        // job_title: user[0].job_title,
        // city: user[0].city,
        // type: user[0].type,
        // country: user[0].country,
      },
    });
  } catch (error) {
    console.error('Error fetching personal info:', error);
    res.status(500).json({
      success: false,
      message: 'Error in fetching personal info',
      error: error.message,
    });
  }
};

const UpdateZoneTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { table } = req.query;
    console.log("table", table);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID',
      });
    }

    // Extract fields from the request body
    const { title, zonal_manager, manager_id, zone_id, del, user, dt } = req.body;

    let sql = `UPDATE ${table} SET `;
    const values = [];

    // Determine which fields to include based on the table name
    if (table === 'users_teams') {
      // For users_teams table
      if (title !== undefined && title !== '') {
        sql += 'title = ?, ';
        values.push(title);
      }
      if (del !== undefined && del !== '') {
        sql += 'del = ?, ';
        values.push(del);
      }
      if (user !== undefined && user !== '') {
        sql += 'user = ?, ';
        values.push(user);
      }
      if (dt !== undefined && dt !== '') {
        sql += 'dt = ?, ';
        values.push(dt);
      }
      if (zone_id !== undefined && zone_id !== '') {
        sql += 'zone_id = ?, ';
        values.push(zone_id);
      }
      if (manager_id !== undefined && manager_id !== '') {
        sql += 'manager_id = ?, ';
        values.push(manager_id);
      }
      // Update the users table assigned_team field with manager_id
      await mysqlConnection.promise().query('UPDATE users SET assigned_team = "m", user_type = "manager" WHERE id = ?', [manager_id]);
    } else if (table === 'users_zones') {
      // For users_zones table
      if (title !== undefined && title !== '') {
        sql += 'title = ?, ';
        values.push(title);
      }
      if (zonal_manager !== undefined && zonal_manager !== '') {
        sql += 'zonal_manager = ?, ';
        values.push(zonal_manager);
      }
      if (del !== undefined && del !== '') {
        sql += 'del = ?, ';
        values.push(del);
      }
      if (dt !== undefined && dt !== '') {
        sql += 'dt = ?, ';
        values.push(dt);
      }
      // Update the users table assigned_team field with zonal_manager
      await mysqlConnection.promise().query('UPDATE users SET assigned_team = "m", user_type = "zone_manager" WHERE id = ?', [zonal_manager]);
    } else {
      // Invalid table name
      return res.status(400).json({
        success: false,
        message: 'Invalid table name',
      });
    }

    // Remove the trailing comma and space
    sql = sql.slice(0, -2) + ' WHERE id = ?';
    values.push(id);

    // Execute the query
    const [result] = await mysqlConnection.promise().query(sql, values);

    res.status(200).json({
      success: true,
      message: `${table} table updated successfully`,
    });
  } catch (error) {
    console.error('Error updating zone team:', error);
    res.status(500).json({
      success: false,
      message: `Error in updating ${table}`,
      error: error.message,
    });
  }
};


const CreateZoneTeam = async (req, res) => {
  try {
    const { table } = req.query;

    // Extract fields from the request body
    const { title, zonal_manager, manager_id, zone_id, del, user, dt } = req.body;
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Kindly add title',
      });
    }
    let sql = `INSERT INTO ${table} SET `;
    const values = [];

    // Add fields to the INSERT query based on the table name
    if (table === 'users_teams') {
      // For users_teams table
      if (title !== undefined && title !== '') {
        sql += 'title = ?, '; 
        values.push(title);
      }
      if (del !== undefined && del !== '') {
        sql += 'del = ?, ';
        values.push(del);
      }
      if (user !== undefined && user !== '') {
        sql += 'user = ?, ';
        values.push(user);
      }
      if (dt !== undefined && dt !== '') {
        sql += 'dt = ?, ';
        values.push(dt);
      }
      if (zone_id !== undefined && zone_id !== '') {
        sql += 'zone_id = ?, ';
        values.push(zone_id);
      }
      if (manager_id !== undefined && manager_id !== '') {
        sql += 'manager_id = ?, ';
        values.push(manager_id);
      }
      // Update the users table assigned_team field with manager_id
      await mysqlConnection.promise().query('UPDATE users SET assigned_team = "m" WHERE id = ?', [manager_id]);
    } else if (table === 'users_zones') {
      // For users_zones table
      if (title !== undefined && title !== '') {
        sql += 'title = ?, ';
        values.push(title);
      }
      if (zonal_manager !== undefined && zonal_manager !== '') {
        sql += 'zonal_manager = ?, ';
        values.push(zonal_manager);
      }
      if (del !== undefined && del !== '') {
        sql += 'del = ?, ';
        values.push(del);
      }
      if (dt !== undefined && dt !== '') {
        sql += 'dt = ?, ';
        values.push(dt);
      }
      if (user !== undefined && user !== '') {
        sql += 'user = ?, ';
        values.push(user);
      }
      // Update the users table assigned_team field with zonal_manager
      await mysqlConnection.promise().query('UPDATE users SET assigned_team = "m" WHERE id = ?', [zonal_manager]);
    } else {
      // Invalid table name
      return res.status(400).json({
        success: false,
        message: 'Invalid table name',
      });
    }

    // Remove the trailing comma and space
    sql = sql.slice(0, -2);

    // Execute the query
    const [result] = await mysqlConnection.promise().query(sql, values);

    res.status(200).json({
      success: true,
      message: `${table? table:""} table Created successfully`,
    });
  } catch (error) {
    console.error('Error inserting into zone team:', error);
    res.status(500).json({
      success: false,
      message: `Error in inserting into ${table?table :"table"}`,
      error: error.message,
    });
  }
};



  module.exports = {ZoneTeamData,GetzoneMemeber,ZoneData,TeamData, GetTeamMemeber,getSpecificteamZone,UpdateZoneTeam,CreateZoneTeam };
  