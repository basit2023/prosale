const { z } = require('zod');
const crypto = require('crypto');
const mysqlConnection = require('../utils/database');
const fs = require('fs');

let user1 = null; // Declare user1 with an initial value

const setUser = (user) => {
  user1 = user;
};

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
    const parsedBody = JSON.parse(req.body.body);
    const { email, password } = parsedBody; // Extract email and password from the request body

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

    // Hash the input using SHA-2 (in this case, SHA-256)
    const hashedInput = crypto.createHash('sha256').update(inputToCheck).digest('hex');

    if (hashedInput === storedPassword) {
      // Retrieve company_creator field from companies table where the name matches the user's name
      const [company] = await mysqlConnection.promise().query('SELECT * FROM companies WHERE company_creator = ?', [user[0].name]);

      // Data to be stored in the JSON response
      const userData = {
        email: user[0].email,
        user_type: user[0].user_type,
        id: user[0].id,
        name: user[0].name,
        company_id:user[0].company_id,
        company_creator: company.length > 0 ? company[0].company_creator : null, // If company_creator exists, assign its value, otherwise null
      };

      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: userData,
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
//ceck supper admin

const checkSupperAdmin = async (req, res) => {
  try {
    const { email } = req.params;

    // Fetch user details and company_creator from tables
    const [user] = await mysqlConnection.promise().query('SELECT u.user_type, c.company_creator FROM users u INNER JOIN companies c ON u.name = c.company_creator WHERE u.email = ?', [email]);

    if (!user.length) {
      return;
      // res.status(404).json({
      //   success: false,
      //   message: 'No company registered',
      //   user: null // No user or company_creator found
      // });
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

      // Set the user using the setUser function
      setUser(data);
     
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
