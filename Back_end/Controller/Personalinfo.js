const { z } = require('zod');
const crypto = require('crypto');
const mysqlConnection = require('../utils/database');
const pako = require('pako');

let user1 = null; 

const setUser = (user) => {
  user1 = user;
};

const getPersonalInfoHandler = async (req, res) => {
  try {
    const { email } = req.params; // Extract email from the request parameters


    const [user] = await mysqlConnection.promise().query('SELECT * FROM users WHERE email = ?', [email]);

    if (!user.length) {
      return res.status(404).json({
        success: false,
        message: 'Email is not registered',
      });
    }

    // Respond with user information
    res.status(200).json({
      success: true,
      message: 'Personal info fetched successfully',
      user: {
        id: user[0].id,
        email: user[0].email,
        name: user[0].name,
        password: user[0].password,
        first_name: user[0].first_name,
        last_name: user[0].last_name,
        img: user[0].files_1,
        role: user[0].designation,
        mobile: user[0].mobile,
        cnic: user[0].cnic,
        isp: user[0].isp,
        gender: user[0].gender,
        department: user[0].department,
        sms: user[0].sms,
        lead_status: user[0].lead_status,
        user_type:user[0].user_type,
        assigned_team:user[0].assigned_team,
        company_id:user[0].company_id,
        
        // Add other fields as needed
      },
    });
  } catch (error) {
    console.error('Error fetching personal info:', error);
    res.status(500).json({
      success: false,
      message: 'Error in fetching personal info',
      error: error.message,
    });
  }
};
const getPersonalInfoHandlerbyId = async (req, res) => {
  try {
    const { id } = req.params; // Extract email from the request parameters


    const [user] = await mysqlConnection.promise().query('SELECT * FROM users WHERE id = ?', [id]);

    if (!user.length) {
      return res.status(404).json({
        success: false,
        message: 'Email is not registered',
      });
    }

    // Respond with user information
    res.status(200).json({
      success: true,
      message: 'Personal info fetched successfully',
      user: {
        id: user[0].id,
        email: user[0].email,
        name: user[0].name,
        password: user[0].password,
        first_name: user[0].first_name,
        last_name: user[0].last_name,
        img: user[0].files_1,
        role: user[0].designation,
        mobile: user[0].mobile,
        cnic: user[0].cnic,
        isp: user[0].isp,
        gender: user[0].gender,
        department: user[0].department,
        sms: user[0].sms,
        lead_status: user[0].lead_status,
        user_type:user[0].user_type,
        assigned_team:user[0].assigned_team,
        
        // Add other fields as needed
      },
    });
  } catch (error) {
    console.error('Error fetching personal info:', error);
    res.status(500).json({
      success: false,
      message: 'Error in fetching personal info',
      error: error.message,
    });
  }
};


const updatePersonalInfoHandler = async (req, res) => {
  const email = req.params.email;
  const prefixedBase64String = `data:image/jpeg;base64,${req.body.avatar}`;

  const {
    first_name,
    last_name,
    avatar,
    gender,
    mobile,
    isp,
    cnic,
    country /* other fields */,
  } = req.body;

  try {
    let changesMade = false;

    // Check if any of the fields are defined
    if (
      first_name !== (undefined || '') || 
      last_name !== (undefined || '') ||
      req.body.avatar !== (undefined || '') ||
      gender !== (undefined || '') ||
      mobile !== (undefined || '') ||
      isp !== (undefined || '') ||
      cnic !== (undefined || '') ||
      country !== (undefined || '')
    ) {
      changesMade = true;
    }

    // If no changes are made, send a message
    if (!changesMade) {
      return res.status(200).json({ success: false, message: 'No changes made.' });
    }

    // Update data in the database, including the avatar
    let sql = 'UPDATE users SET  ';
    const values = [];

    if (first_name !== undefined && first_name !== '') {
      sql += 'first_name = ?, ';
      values.push(first_name);
    }

    if (last_name !== undefined && last_name !== '') {
      sql += 'last_name = ?, ';
      values.push(last_name);
    }

    if (req.body.avatar !== undefined && req.body.avatar !== '') {
      sql += 'files_1 = ?, ';
      values.push(prefixedBase64String);
    }

    if (gender !== undefined && gender !== '') {
      sql += 'gender = ?, ';
      values.push(gender);
    }

    if (mobile !== undefined && mobile !== '') {
      sql += 'mobile = ?, ';
      values.push(mobile);
    }

    if (isp !== undefined && isp !== '') {
      sql += 'isp = ?, ';
      values.push(isp);
    }

    if (cnic !== undefined && cnic !== '') {
      sql += 'cnic = ?, ';
      values.push(cnic);
    }

    if (country !== undefined) {
      sql += 'country = ?, ';
      values.push(country);
    }

    // Remove the trailing comma and complete the SQL statement
    sql = sql.slice(0, -2) + ' WHERE email = ?';
    values.push(email);

    mysqlConnection.query(sql, values, (error, results) => {
      if (error) {
        console.error('Error updating data:', error);
        res.status(500).json({ error: 'Error updating profile. Please try again.' });
      } else {
        res.status(200).json({ success: true, message: 'Profile updated successfully!' });
      }
    });
  } catch (error) {
    console.error('Error decoding avatar:', error);
    res.status(500).json({ success: false, error: 'Error updating profile. Please try again.' });
  }
};



module.exports = { getPersonalInfoHandler, updatePersonalInfoHandler, getPersonalInfoHandlerbyId};
