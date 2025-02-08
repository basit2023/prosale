const mysqlConnection = require('../../utils/database');
const ReassinedLead = async (req, res) => {
    try {
      const { ids, assigned_to, view_dt, assigned_on, assigned_through } = req.body;
       
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or empty IDs array',
        });
      }
  
      const [leads] = await mysqlConnection.promise().query("SELECT name FROM users WHERE email=?", [assigned_through]);
      
      let sql = 'UPDATE leads_main SET ';
      const values = [];
  
      if (assigned_to !== undefined && assigned_to !== '') {
        sql += 'assigned_to = ?, ';
        values.push(assigned_to);
      }
      if (view_dt !== undefined && view_dt !== '') {
        sql += 'view_dt = ?, ';
        values.push(view_dt);
      }
      if (assigned_on !== undefined && assigned_on !== '') {
        sql += 'assigned_on = ?, ';
        values.push(assigned_on);
      }
      if (leads[0].name !== undefined && leads[0].name !== '') {
        sql += 'assigned_through = ?, ';
        values.push(leads[0].name);
      }
  
      if (values.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields provided for update',
        });
      }
  
      sql = sql.slice(0, -2) + ' WHERE id IN (?)'; // Update WHERE clause to handle multiple IDs
      values.push(ids); // Add the IDs array as a parameter
  
      const [result] = await mysqlConnection.promise().query(sql, values);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'No lead customers selected to update',
        });
      }
  
      res.status(200).json({
        success: true,
        message: 'New lead customers assigned successfully',
      });
    } catch (error) {
      console.error('Error assigning leads to new customers:', error);
      res.status(500).json({
        success: false,
        message: 'Error in assigning leads to new customers',
        error: error.message,
      });
    }
  };
  

  module.exports = { ReassinedLead };