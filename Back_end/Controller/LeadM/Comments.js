const mysqlConnection = require('../../utils/database');

const CreateComments = async (req, res) => {
    try {
      // Retrieve the user id from the request parameters
      const {id} = req.params 
  
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user id',
        });
      }
  
      // Extract the fields from the request body
      let { comments, dt, status, user, followupdate, followup} = req.body; // Use let instead of const
      let lead_id=id;
      
  
      // Build the INSERT query
      const insertQuery = `
        INSERT INTO leads_comments (lead_id, comments, status, user, followupdate, followup)
        VALUES (?, ?, ?, ?, ?, ?);
      `;
  
      const insertParams = [lead_id,comments, status, user, followupdate, followup];
  
      // Execute the INSERT query
      const results = await new Promise((resolve, reject) => {
        mysqlConnection.query(insertQuery, insertParams, (error, results) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(results);
        });
      });
  
    
      res.status(200).json({ success: true, message: "comments saved successfully", results });
    } catch (error) {
      console.error('Error executing MySQL query:', error);
      res.status(500).json({ success: false, message: "Internal Server Error", error });
    }
  };


  const GetComments = async (req, res) => {
    const {id}=req.params;
    try {
        const [leads] = await mysqlConnection.promise().query(`
            SELECT lc.dt AS date,
                   lc.lead_id AS lead_id,
                   lc.id AS id,
                   lc.comments AS comments,
                   lc.status AS status,
                   CONCAT(u.first_name, ' ', u.last_name) AS fullName,
                   lc.followupdate,
                   lc.followup
            FROM leads_comments lc
            JOIN users u ON lc.user = u.name WHERE lc.status = "N" AND lc.lead_id=?;
        `,[id]);

        if (!leads.length) {
            return res.status(200).json({
                success: true,
                message: 'No leads found',
            });
        }

        // Respond with all leads information
        res.status(200).json({
            success: true,
            message: 'Leads information fetched successfully',
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



// Get followups, including the customer's `full_name` from leads_customers
const GetFollowup = async (req, res) => {
  const { user } = req.params;
  const { permission, id } = req.query;

  // normalize types
  const perm = Number(permission) || 0;   // permission level of requester
  const managerId = Number(id) || 0;      // id used in zone/team subqueries

  try {
    let query = '';
    let queryParams = [];

    // Common SELECT + JOINs for all branches:
    //  lc.user joins to users.name (as in your schema)
    //  lc.lead_id -> leads_main.id -> leads_main.customer -> leads_customers.id
    const BASE_SELECT = `
      SELECT
        lc.dt              AS date,
        lc.lead_id         AS lead_id,
        lc.id              AS id,
        lc.comments        AS comments,
        lc.status          AS status,
        CONCAT(u.first_name, ' ', u.last_name) AS fullName,   -- commenter display name
        lc.followupdate,
        lc.followup,
        lc.user,
        lc.nextfollowup,
        cust.full_name     AS full_name                        -- <-- customer's name from leads_customers
      FROM leads_comments lc
      JOIN users u            ON lc.user = u.name
      LEFT JOIN leads_main lm ON lm.id = lc.lead_id
      LEFT JOIN leads_customers cust ON cust.id = lm.customer
      WHERE lc.status = "N" AND u.del = "N"
    `;

    const ORDER = ` ORDER BY lc.dt DESC`;

    if (perm >= 9) {
      // Admin: all followups
      query = BASE_SELECT + ORDER;
    } else if (perm >= 5) {
      // Zonal Manager (5–8): users in their zone OR their own
      query = BASE_SELECT + `
        AND (
          u.id IN (
            SELECT uu.id
            FROM users_zones uz
            JOIN users_teams ut ON uz.id = ut.zone_id
            JOIN users uu ON uu.assigned_team = ut.id
            WHERE uz.zonal_manager = ?
          )
          OR lc.user = ?
        )
      ` + ORDER;
      queryParams = [managerId, user];
    } else if (perm === 4) {
      // Team Manager (4): users in their team OR their own
      query = BASE_SELECT + `
        AND (
          u.id IN (
            SELECT uu.id
            FROM users_teams ut
            JOIN users uu ON uu.assigned_team = ut.id
            WHERE ut.manager_id = ?
          )
          OR lc.user = ?
        )
      ` + ORDER;
      queryParams = [managerId, user];
    } else {
      // Regular user: only their own followups
      query = BASE_SELECT + ` AND lc.user = ?` + ORDER;
      queryParams = [user];
    }

    const [leads] = await mysqlConnection.promise().query(query, queryParams);

    if (!leads.length) {
      return res.status(200).json({
        success: true,
        message: 'No followups found',
        leads: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Followups fetched successfully',
      leads,
    });
  } catch (error) {
    console.error('Error fetching followups:', error);
    return res.status(500).json({
      success: false,
      message: 'Error in fetching followups',
      error: error.message,
    });
  }
};




const DeleteComments = async (req, res) => {
  const { id } = req.params;
  try {
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID',
      });
    }

    // Query to select the status based on the ID
    const selectQuery = 'SELECT status FROM leads_comments WHERE id = ?';

    mysqlConnection.query(selectQuery, [id], (error, results) => {
      if (error) {
        console.error('Error selecting status:', error);
        res.status(500).json({ error: 'Error selecting status. Please try again.' });
      } else {
        // Check if any rows are returned
        if (results.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'No row found with the provided ID',
          });
        }
        
        // Extract the status from the results
        const status = results[0].status;

        // Check if the status is 'N'
        if (status === 'N') {
          // Query to update the status to 'Y' for the given ID
          const updateQuery = 'UPDATE leads_comments SET status = ? WHERE id = ?';
          mysqlConnection.query(updateQuery, ['Y', id], (updateError, updateResults) => {
            if (updateError) {
              console.error('Error updating status:', updateError);
              res.status(500).json({ error: 'Error updating status. Please try again.' });
            } else {
              res.status(200).json({ success: true, message: 'Status updated successfully!' });
            }
          });
        } else {
          // If status is not 'N', send a message indicating it's already updated
          res.status(200).json({ success: true, message: 'Status is already updated to Y.' });
        }
      }
    });
  } catch (error) {
    console.error('Error while updating status:', error);
    res.status(500).json({ success: false, error: 'Error updating status. Please try again.' });
  }
};
const DoneFollowUps = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID',
      });
    }

    // Query to select the nextfollowup based on the ID
    const selectQuery = 'SELECT nextfollowup FROM leads_comments WHERE id = ?';

    mysqlConnection.query(selectQuery, [id], (error, results) => {
      if (error) {
        console.error('Error selecting nextfollowup:', error);
        return res.status(500).json({ error: 'Error selecting nextfollowup. Please try again.' });
      }

      // Check if any rows are returned
      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No row found with the provided ID',
        });
      }

      // Extract the nextfollowup value from the results
      const nextfollowup = results[0].nextfollowup;

      // Check if nextfollowup is already 0
      if (nextfollowup === 0) {
        return res.status(200).json({
          success: true,
          message: 'nextfollowup is already 0.',
        });
      }

      // Query to update the nextfollowup to 1 for the given ID
      const updateQuery = 'UPDATE leads_comments SET nextfollowup = ? WHERE id = ?';
      mysqlConnection.query(updateQuery, [1, id], (updateError, updateResults) => {
        if (updateError) {
          console.error('Error updating nextfollowup:', updateError);
          return res.status(500).json({ error: 'Error updating nextfollowup. Please try again.' });
        }

        return res.status(200).json({
          success: true,
          message: 'nextfollowup updated to 1 successfully!',
        });
      });
    });
  } catch (error) {
    console.error('Error while updating nextfollowup:', error);
    return res.status(500).json({
      success: false,
      error: 'Error updating nextfollowup. Please try again.',
    });
  }
};

const AllLabels = async (req, res) => {
  try {
    // Use a connection pool to handle connections
    const [rows, fields] = await mysqlConnection.promise().query('SELECT label FROM leads_labels WHERE dropdown = "Y"');
   
    // Extract names from the result and construct objects with same name and value
    const show_labels = rows.map(label => ({ name: label.label, value: label.label }));

    // Respond with office names array
    res.status(200).json({
      success: true,
      message: 'All labels successfully',
      show_labels: show_labels,
    });
  } catch (error) {
    console.error('Error fetching all labels:', error);
    res.status(500).json({
      success: false,
      message: 'Error in fetching all labels',
      error: error.message,
    });
  }
};


const SelectForBox = async (req, res) => {
  try {
    const {id} = req.params; // Assuming userId is passed as a parameter
   
    // Use a connection pool to handle connections
    const [rows, fields] = await mysqlConnection.promise().query(
      'SELECT llb.label FROM leads_labels llb JOIN leads_main u ON u.leads_label = llb.id WHERE u.id = ?',
      [id]
    );

    // Extract names from the result and construct objects with same name and value
    const label = rows.map(label => label.label);

    // Respond with office names array
    res.status(200).json({
      success: true,
      message: 'Labels fetched successfully',
      label: label,
    });
  } catch (error) {
    console.error('Error fetching labels:', error);
    res.status(500).json({
      success: false,
      message: 'Error in fetching labels',
      error: error.message,
    });
  }
};


const UpdateLabel = async (req, res) => {
  try {
    const { id } = req.params;
    let { leads_label, dt } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user_id',
      });
    }

    const [rows, fields] = await mysqlConnection.promise().query(
      'SELECT id FROM leads_labels  WHERE label = ?',
      [leads_label]
    );


    if (!rows || !rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Label not found',
      });
    }

    const labelId = rows[0].id;

    let sql = 'UPDATE leads_main SET ';
    const values = [];

    if (labelId !== undefined && labelId !== '') {
      sql += 'leads_label = ?, ';
      values.push(labelId);
    }
    if (dt !== undefined && dt !== '') {
      sql += 'dt = ?, ';
      values.push(dt);
    }

    // Remove the trailing comma and space
    sql = sql.slice(0, -2) + ' WHERE id = ?';
    values.push(id);

    await mysqlConnection.promise().query(sql, values);

    res.status(200).json({ success: true, message: 'Label updated successfully!' });
  } catch (error) {
    console.error('Error while updating Label:', error);
    res.status(500).json({ success: false, error: 'Error updating Label. Please try again.' });
  }
};

const SaveTime = async (req, res) => {
  try {
    // Extract fields from the request body
    const { leadsId, user, phone, opentime, totaltime } = req.body;

    

    const sql = `
      INSERT INTO leads_time (leadsId, user, phone, opentime, totaltime) 
      VALUES (?, ?, ?, ?, ?)
    `;

    const values = [leadsId, user, phone, new Date(opentime), totaltime];

    // Execute the query
    const [result] = await mysqlConnection.promise().query(sql, values);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Time saved successfully',
      customer_id: result.insertId,
    });
  } catch (error) {
    console.error('Error saving time:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving time',
      error: error.message,
    });
  }
};


const CreateActivityReport = async (req, res) => {
  try {
   

    // Extract the fields from the request body
    let { daily_office_visits, client_matured, daily_lead_follow_up, lead_assigned, dealers_meeting, dealers_register, office_activity, user, del} = req.body; // Use let instead of const
    
    

    // Build the INSERT query
    const insertQuery = `
      INSERT INTO leads_activity_report (daily_office_visits, client_matured, daily_lead_follow_up, lead_assigned, dealers_meeting, dealers_register, office_activity, user, del)
      VALUES (?, ?, ?, ?, ?,? , ?, ?, ?);
    `;

    const insertParams = [daily_office_visits, client_matured, daily_lead_follow_up, lead_assigned, dealers_meeting, dealers_register, office_activity, user, del];

    // Execute the INSERT query
    const results = await new Promise((resolve, reject) => {
      mysqlConnection.query(insertQuery, insertParams, (error, results) => {
        if (error) {
          reject(error);
          return; 
        }
        resolve(results);
      });
    });

  
    res.status(200).json({ success: true, message: "Report saved successfully", results });
  } catch (error) {
    console.error('Error executing MySQL query:', error);
    res.status(500).json({ success: false, message: "Internal Server Error", error });
  }
};
  module.exports = { DoneFollowUps,SaveTime, CreateComments, GetComments,DeleteComments,AllLabels,SelectForBox,UpdateLabel, GetFollowup,CreateActivityReport};
