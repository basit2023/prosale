


const mysqlConnection = require('../utils/database');

const SignUpHandler = async (req, res) => {
  try {
    const { first_name, last_name, name, email,lead_status,sms,del, password, confirmPassword,user_type} = req.body;

    // Check if email or username already exists
    const [existingUser] = await mysqlConnection.promise().query('SELECT * FROM users WHERE email = ? OR name = ?', [email, name]);

    if (existingUser.length > 0) {
      // Email or username already exists
      return res.status(400).json({
        success: false,
        message: 'Email or username is already registered. Please try with another.',
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }


    await mysqlConnection.promise().query('INSERT INTO users (first_name, last_name, name, email, user_type, password,sms,del, lead_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [first_name, last_name, name, email,user_type, password,sms,del,lead_status]);

    // Respond with success message
    res.status(201).json({
      success: true,
      message: 'User created successfully',
    });

  } catch (error) {
    console.error('Error during sign up:', error);
    res.status(500).json({
      success: false,
      message: 'Error in sign up',
      error: error.message,
    });
  }
};

const OnBordingHandler = async (req, res) => {
  try {
    const {email}=req.params;
    console.log("the email is :",email)
    const { title,licence_type,address} = req.body;

    const [user]=await mysqlConnection.promise().query(`SELECT * FROM users where email =?`,[email]);
    console.log("the user:",user,email)
   const company_creator=user[0].name;
   console.log("the company creator is:",company_creator)
    await mysqlConnection.promise().query('INSERT INTO companies (title, licence_type, address, company_creator) VALUES (?, ?, ?, ?)', [title, licence_type, address, company_creator]);

    // Respond with success message
    res.status(201).json({
      success: true,
      message: 'Company created successfully',
    });

  } catch (error) {
    console.error('Error during Creating Company:', error);
    res.status(500).json({
      success: false,
      message: 'Error in Creating Comapny',
      error: error.message,
    });
  }
};

module.exports = { SignUpHandler,OnBordingHandler };
