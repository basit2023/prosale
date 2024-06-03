const mysqlConnection = require('../utils/database');

const DropDown = async (req, res) => {
  try {
    const { parent_id } = req.params; // Extract parent_id from the query parameters
    if (!parent_id) {
      return res.status(400).json({ error: 'Missing parent_id in the request.' });
    }

    const query = 'SELECT * FROM dropdown_items WHERE parent_id = ?';

    // Use a promise wrapper to make the MySQL query asynchronous
    const results = await new Promise((resolve, reject) => {
      mysqlConnection.query(query, [parent_id], (error, results) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(results);
      });
    });
    res.status(200).json(results);
  } catch (error) {
    console.error('Error executing MySQL query:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { DropDown };
