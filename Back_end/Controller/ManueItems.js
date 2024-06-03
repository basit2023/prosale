const mysqlConnection = require('../utils/database');
const MenuItems = async (req, res) => {
    try {
      const query = 'SELECT * FROM nav_items';
    
      // Use a promise wrapper to make the MySQL query asynchronous
      const results = await new Promise((resolve, reject) => {
        mysqlConnection.query(query, (error, results) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(results);
        });
      });
      // console.log("the result is:",results)
      
      res.status(200).json(results);
    } catch (error) {
      console.error('Error executing MySQL query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  module.exports = { MenuItems };