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


const SpecificEmp = async (req, res) => {
  try {
    const { email } = req.query;

    if (email) {
      // 1) Get the user by email
      const [userRows] = await mysqlConnection
        .promise()
        .query(
          `SELECT *
             FROM users 
            WHERE email = ? 
            LIMIT 1`,
          [email]
        );

      if (userRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No user found for the provided email',
        });
      }

      const user = userRows[0];

      // 2) Check if this user is a manager of any team(s)
      const [teamRows] = await mysqlConnection
        .promise()
        .query(
          `SELECT id 
             FROM users_teams 
            WHERE manager_id = ?`,
          [user.id]
        );

      // MANAGER: return self + team members (all in a single `users` array)
      if (teamRows.length > 0) {
        const teamIds = teamRows.map((t) => t.id);

        const [membersRows] = await mysqlConnection
          .promise()
          .query(
            `SELECT *
               FROM users 
              WHERE assigned_team IN (?)`,
            [teamIds]
          );

        // Ensure manager is included even if not assigned to their own team
        const allUsers = [
          user,
          ...membersRows.filter((m) => m.id !== user.id),
        ];

        return res.status(200).json({
          success: true,
          message: 'Manager and team users fetched successfully',
          roleHint: 'manager',
          manager: { id: user.id, email: user.email },
          users: allUsers, // self + team members
        });
      }

      // REGULAR USER: just this user inside `users`
      return res.status(200).json({
        success: true,
        message: 'User fetched successfully',
        roleHint: 'user',
        users: [user],
      });
    }

    // No email => all users (admin-ish listing)
    const [allUsers] = await mysqlConnection
      .promise()
      .query(`SELECT * FROM users`);

    if (!allUsers.length) {
      return res.status(404).json({
        success: false,
        message: 'No users found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'All users fetched successfully',
      roleHint: 'admin',
      users: allUsers,
    });
  } catch (error) {
    console.error('Error fetching user information:', error);
    return res.status(500).json({
      success: false,
      message: 'Error in fetching user information',
      error: error.message,
    });
  }
};





module.exports = { AllEmployees,SpecificEmp };
