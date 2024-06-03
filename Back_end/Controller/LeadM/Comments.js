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
      let { comments, dt, status, user } = req.body; // Use let instead of const
      let lead_id=id;
      
  
      // Build the INSERT query
      const insertQuery = `
        INSERT INTO leads_comments (lead_id, comments, status, user)
        VALUES (?, ?, ?, ?);
      `;
  
      const insertParams = [lead_id,comments, status, user];
  
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
                   CONCAT(u.first_name, ' ', u.last_name) AS fullName
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

const AllLabels = async (req, res) => {
  try {
    // Use a connection pool to handle connections
    const [rows, fields] = await mysqlConnection.promise().query('SELECT label FROM leads_labels');

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


  module.exports = { CreateComments, GetComments,DeleteComments,AllLabels,SelectForBox,UpdateLabel};
