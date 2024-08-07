const { z } = require('zod');
const crypto = require('crypto');
const mysqlConnection = require('../utils/database');
const fs = require('fs');


// const loginHandler = async (req, res) => {
//   try {
//     const parsedBody = JSON.parse(req.body.body);
//     const { email, password } = parsedBody; // Extract email and password from the request body


//     if (!email || !password) {
      
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid email or password',
//       });
//     }
   
//     const [user] = await mysqlConnection.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    
//     if (!user.length) {
//       return res.status(404).json({
//         success: false,
//         message: 'Email is not registered',
//       });
//     }

//     const storedPassword = user[0].password;
//     const inputToCheck = password;

//     // Hash the input using SHA-2 (in this case, SHA-256)
//     const hashedInput = crypto.createHash('sha256').update(inputToCheck).digest('hex');

//     if (hashedInput == storedPassword) {
//       // Data to be stored in the JSON file
//       const data = {
//         email: user[0].email,
//         user_type: user[0].user_type,
//         user_id: user[0].id,
//         name:user[0].name,
//       };

      

//       res.status(200).json({
//         success: true,
//         message: 'Login successful',
//         user: {
//           email: user[0].email,
//           user_type: user[0].user_type,
          
//         },
//       });
//     } else {
//       res.status(401).json({
//         success: false,
//         message: 'Incorrect password',
//       });
//     }
//   } catch (error) {
//     console.error('Error during login:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error in login',
//       error: error.message,
//     });
//   }
// };
const loginHandler = async (req, res) => {
  try {
    let parsedBody;
    try {
      parsedBody = JSON.parse(req.body.body);
    } catch (err) {
      console.error('JSON parsing error:', err);
      return res.status(400).json({
        success: false,
        message: 'Invalid request body',
      });
    }

    const { email, password } = parsedBody;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const [user] = await mysqlConnection.promise().query('SELECT * FROM users WHERE email = ? AND del = "N"', [email]);

    if (!user.length) {
      return res.status(404).json({
        success: false,
        message: 'User Not Found',
      });
    }

    const storedPassword = user[0].password;
    const inputToCheck = password;

    // Hash the input using SHA-256
    const hashedInput = crypto.createHash('sha256').update(inputToCheck).digest('hex');

    if (hashedInput === storedPassword) {
      const [company] = await mysqlConnection.promise().query('SELECT * FROM companies WHERE company_creator = ?', [user[0].name]);

      const userData = {
        email: user[0].email,
        user_type: user[0].user_type,
        id: user[0].id,
        name: user[0].name,
        company_id: user[0].company_id,
        company_creator: company.length > 0 ? company[0].company_creator : null,
      };

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: userData,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password',
      });
    }
  } catch (error) {
    console.error('500 Error during login:', error);
    return res.status(500).json({
      success: false,
      message: 'Error in login',
      error: error.message,
    });
  }
};


const checkSupperAdmin = async (req, res) => {
  try {
    const { email } = req.params;

    // Fetch user details and company_creator from tables
    const [user] = await mysqlConnection.promise().query('SELECT u.user_type, c.company_creator FROM users u INNER JOIN companies c ON u.name = c.company_creator WHERE u.email = ?', [email]);

    if (!user.length) {
      return res.status(200).json({
        success: true,
        message: 'No company registered',
        user: "not_superadmin"
      });
    } else {
      return res.status(200).json({
        success: true,
        message: 'Company registered',
        user: {
          user_type: user[0].user_type,
          company_creator: user[0].company_creator
        }
      });
    }
  } catch (error) {
    console.error('Error in checkSupperAdmin:', error);
    return res.status(500).json({
      success: false,
      message: 'Error in checking super admin',
      error: error.message
    });
  }
};


const loginHandlerA = async (req, res) => {
  try {
    const parsedBody = JSON.parse(req.body.body);
    const { email, password } = parsedBody; // Extract email and password from the request body


    if (!email || !password) {
      
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
   
    const [user] = await mysqlConnection.promise().query('SELECT * FROM users WHERE email = ?', [email]);
  
    if (!user.length) {
      return res.status(404).json({
        success: false,
        message: 'Email is not registered',
      });
    }

    const storedPassword = user[0].password;
    const inputToCheck = password;

    // Hash the input using SHA-2 (in this case, SHA-256)
    const hashedInput = crypto.createHash('sha256').update(inputToCheck).digest('hex');

    if (hashedInput == storedPassword) {
      // Data to be stored in the JSON file
      const data = {
        email: user[0].email,
        user_type: user[0].user_type,
        user_id: user[0].id,
      };

      
     
      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          email: user[0].email,
          password: inputToCheck,
          id:user[0].id,
          name: `${user[0].first_name} ${user[0].last_name}`,
        },
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Incorrect password',
      });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      success: false,
      message: 'Error in login',
      error: error.message,
    });
  }
};


module.exports = { loginHandler,loginHandlerA,checkSupperAdmin };
