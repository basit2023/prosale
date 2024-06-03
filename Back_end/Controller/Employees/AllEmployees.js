const mysqlConnection = require('../../utils/database');
const AllEmployees = async (req, res) => {
  try {
    const { email } = req.query;
    
    const [company] = await mysqlConnection.promise().query('SELECT * FROM users where email=?', [email]);

    
    const [users] = await mysqlConnection.promise().query(`
        SELECT u.*, c.title AS company_title
        FROM users u
        INNER JOIN companies c ON u.company_id = c.id
        WHERE FIND_IN_SET(u.company_id, ?) > 0
    `, [company[0].company_id]);


    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: 'No users found',
      });
    }
  
    const usersWithOffice = await Promise.all(
      users.map(async (user) => {
        // Fetch user's office information
        const [officeResult] = await mysqlConnection
          .promise()
          .query(`
            SELECT uo.name AS office_name, uj.user
            FROM users_jobs uj
            JOIN users_offices uo ON FIND_IN_SET(uo.id, uj.offices) > 0
            WHERE uj.user IN (SELECT name FROM users WHERE email = ?);
          `, [user.email]);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          password: user.password,
          first_name: user.first_name,
          last_name: user.last_name,
          designation: user.designation,
          mobile: user.mobile,
          cnic: user.cnic,
          isp: user.isp,
          gender: user.gender,
          department: user.department,
          sms: user.sms,
          status: user.lead_status,
          del: user.del,
          company_title:user.company_title,
          office: officeResult.map((office) => ({
            office_name: office.office_name,
            user: office.user,
          })),
          // Add other fields as needed
        };
      })
    );

    // Respond with all users' information including office details
    res.status(200).json({
      success: true,
      message: 'All user information with office details fetched successfully',
      users: usersWithOffice,
    });
  } catch (error) {
    console.error('Error fetching user information:', error);
    res.status(500).json({
      success: false,
      message: 'Error in fetching user information',
      error: error.message,
    });
  }
};

module.exports = { AllEmployees };
