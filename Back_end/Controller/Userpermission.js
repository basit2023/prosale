const { promisify } = require('util');
const mysqlConnection = require('../utils/database');

const Userpermission = async (req, res) => {
  try {
    // Retrieve the email from the request parameters
    const { email } = req.params;
    

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email',
      });
    }

    // Query to retrieve the user_type from the users table
    const userTypeQuery = 'SELECT user_type FROM users WHERE email = ?';

    // Execute the user type query
    const userResults = await promisify(mysqlConnection.query).bind(mysqlConnection)(userTypeQuery, [email]);
    
    // Extract the user_type from the userResults
    const user_type = userResults[0]?.user_type;

    // Define a query based on the user_type to retrieve data from another table
    const query = 'SELECT * FROM users_types WHERE type = ?';

    // Execute the query based on the user_type
    const results = await promisify(mysqlConnection.query).bind(mysqlConnection)(query, [user_type]);

    res.status(200).json({ success: true, message: 'Permission granted', results });
  } catch (error) {
    console.error('Error executing MySQL query:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error });
  }
};

//all type permissions
const GetAllPermission = async (req, res) => {
  const {email}=req.params;
  try {
      const [permission] = await mysqlConnection.promise().query(`
                SELECT ut.Edit_permission,
                ut.Create_permission,
                ut.View_permission,
                ut.permission_level,
                ut.type
            FROM
                users u
            JOIN
                users_types ut ON u.user_type = ut.type
            WHERE
                u.email =?;
      `,[email]);

      if (!permission.length) {
          return res.status(200).json({
              success: true,
              message: 'No permission found',
          });
      }

      // Respond with all leads information
      res.status(200).json({
          success: true,
          message: 'All permission fetched successfully',
          permission: permission,
      });
  } catch (error) {
      console.error('Error fetching users permissons:', error);
      res.status(500).json({
          success: false,
          message: 'Error in fetching users permission',
          error: error.message,
      });
  }
};
module.exports = { Userpermission, GetAllPermission };
