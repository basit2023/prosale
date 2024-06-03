const mysqlConnection = require('../../utils/database');
const UpdateVaultInfo = async (req, res) => {
    try {
      const id = req.params.id;
  
  
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user_id',
        });
      }
  
      // Extract the fields from the request body
      let { name, password,user_type,dt} = req.body;
  
  
      let sql = 'UPDATE users SET ';
      const values = [];
  
     
      if (name !== undefined && name !== '') {
        sql += 'name = ?, ';
        values.push(name);
      }
      if (password !== undefined && password !== '') {
        sql += 'password = ?, ';
        values.push(password);
      }
      if (user_type !== undefined && user_type !== '') {
        sql += 'user_type = ?, ';
        values.push(user_type);
      }
      if (dt !== undefined && dt !== '') {
        sql += 'dt = ?, ';
        values.push(dt);
      }
  
  
      // Remove the trailing comma and space
      sql = sql.slice(0, -2) + ' WHERE id = ?';
      values.push(id);
  
      mysqlConnection.query(sql, values, (error, results) => {
        if (error) {
          console.error('Error updating Vault info data:', error);
          res.status(500).json({ error: 'Error updating Vault info. Please try again.' });
        } else {
          res.status(200).json({ success: true, message: 'Vault Info updated successfully!' });
        }
      });
    } catch (error) {
      console.error('Error while updating Vault information:', error);
      res.status(500).json({ success: false, error: 'Error updating Vault info. Please try again.' });
    }
  };
  module.exports = { UpdateVaultInfo };