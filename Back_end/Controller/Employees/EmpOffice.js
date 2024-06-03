const mysqlConnection = require('../../utils/database');

const EmpOffice = async (req, res) => {
  try {
    // Retrieve the user email from the request query parameters
    const userEmail = req.params.email;


    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user email',
      });
    }

    const query = `
      SELECT uo.name AS office_name, uj.user
      FROM users_jobs uj
      JOIN users_offices uo ON FIND_IN_SET(uo.id, uj.offices) > 0
      WHERE uj.id IN (SELECT id FROM users WHERE email = ?);
    `;

    const results = await new Promise((resolve, reject) => {
      mysqlConnection.query(query, [userEmail], (error, results) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(results);
      });
    });

    res.status(200).json({ success: true, message: "User details with office names", results });
  } catch (error) {
    console.error('Error executing MySQL query:', error);
    res.status(500).json({ success: false, message: "Internal Server Error", error });
  }
};

module.exports = { EmpOffice };
