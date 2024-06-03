const mysqlConnection = require('../utils/database');

const ForgetPassword = async (req, res) => {
  const email = req.params.email;
  const { password /* other fields */ } = req.body;
  

  try {
    // Update data in the database, including the password
    const sql = 'UPDATE users SET password = ? WHERE email = ?';
    const values = [password, email];

    mysqlConnection.query(sql, values, (error, results) => {
      if (error) {
        console.error('Error updating data:', error);
        res.status(500).json({ error: 'Error updating password. Please try again.' });
      } else {
        res.status(200).json({ success: true, message: 'Password updated successfully!' });
      }
    });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Error updating password. Please try again.' });
  }
};


//reset password

const ResetPassword = async (req, res) => {
  const {email,password} = req.body;

    try {
      // Check if the email exists in the database
      const checkEmailSql = 'SELECT * FROM users WHERE email = ?';
      const checkEmailValues = [email];

      mysqlConnection.query(checkEmailSql, checkEmailValues, (error, results) => {
        if (error) {
          console.error('Error checking email:', error);
          return res.status(500).json({success: false, message: 'Error checking email. Please try again.' });
        }

        if (results.length === 0) {
          // If email does not exist in the database, return an error response
          return res.status(404).json({success: false, message: 'Email not found. Please enter another email.' });
        }

        // Update data in the database, including the password
        const updateSql = 'UPDATE users SET password = ? WHERE email = ?';
        const updateValues = [password, email];

        mysqlConnection.query(updateSql, updateValues, (updateError, updateResults) => {
          if (updateError) {
            console.error('Error updating password:', updateError);
            return res.status(500).json({success: false, message: 'Error updating password. Please try again.' });
          }
          
          res.status(200).json({ success: true, message: 'Password updated successfully!' });
        });
      });
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({success: false, error: 'Error updating password. Please try again.' });
    }
};

module.exports = { ForgetPassword,ResetPassword };
