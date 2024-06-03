const { z } = require('zod');
const crypto = require('crypto');
const util = require('util');
const mysqlConnection = require('../../utils/database');

const UserDetails = async (req, res) => {
  try {
    // Retrieve the user email from the request body
    const { email } = req.params; 

   
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user email',
      });
    }

    const query = `
      SELECT *
      FROM users_details
      WHERE user_id IN (
          SELECT id
          FROM users
          WHERE email = ?
      );
    `;

  

    // Use a promise wrapper to make the MySQL query asynchronous
    const results = await new Promise((resolve, reject) => {
      mysqlConnection.query(query, [email], (error, results) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(results);
      });
    });

    // console.log(results); // Adjust this based on how you want to handle the results
    res.status(200).json({ success: true, message: "User details", results });
  } catch (error) {
    console.error('Error executing MySQL query:', error);
    res.status(500).json({ success: false, message: "Internal Server Error", error });
  }
};



const queryAsync = util.promisify(mysqlConnection.query).bind(mysqlConnection);

const createUserDetails = async (req, res) => {
  try {
    const userDetails = req.body;
    delete userDetails.id;
    // userDetails.dob='10/20/1999';
    // console.log("the dob is:------------------>",userDetails.dob)
    if(userDetails.dob){
      userDetails.dob =userDetails.dob.split('T')[0];
      // console.log("the new dop is;",userDetails.dob)
    }
    // Create a new row in the users_details table
    const query = 'INSERT INTO users_details SET ?';

    // Use queryAsync for async/await
    const results = await queryAsync(query, userDetails);

    res.status(201).json({ success: true, message: 'User details created successfully' });
  } catch (error) {
    console.error('Error creating user details:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};


// update SubmitHandler
const updateUserDetails = async (req, res) => {
  try {
    // Retrieve the user email from the request parameters
    const { email } = req.params;
    // console.log("Getting email for updating userDetails:",email, req.body)
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user email',
      });
    }

    // Retrieve the fields from the request body
    let { id, user_id, dob, address, city, whatsapp, instagram, twitter, facebook, linkedin, del, dt, user } = req.body;
    if(dob){
      dob =dob.split('T')[0];
      // console.log("the new dop is;",dob)
    }
    // Build the SQL update query based on provided fields
    const updateFields = [];
    const updateValues = [];

    if (id !== undefined && id !=='') {
      updateFields.push('id = ?');
      updateValues.push(id);
    }
    if (user_id !== undefined && id !=='') {
      updateFields.push('user_id = ?');
      updateValues.push(user_id);
    }
    if (dob !== undefined && dob !=='') {
      updateFields.push('dob = ?');
      updateValues.push(dob);
    }
    if (address !== undefined && address !=='') {
      updateFields.push('address = ?');
      updateValues.push(address);
    }
    if (city !== undefined && city !== '') {
      updateFields.push('city = ?');
      updateValues.push(city);
    }
    if (whatsapp !== undefined && whatsapp !=='') {
      updateFields.push('whatsapp = ?');
      updateValues.push(whatsapp);
    }
    if (instagram !== undefined && instagram !=='') {
      updateFields.push('instagram = ?');
      updateValues.push(instagram);
    }
    if (twitter !== undefined && twitter !=='') {
      updateFields.push('twitter = ?');
      updateValues.push(twitter);
    }
    if (facebook !== undefined && facebook !=='') {
      updateFields.push('facebook = ?');
      updateValues.push(facebook);
    }
    if (linkedin !== undefined && linkedin !=='') {
      updateFields.push('linkedin = ?');
      updateValues.push(linkedin);
    }
    if (del !== undefined && del !=='') {
      updateFields.push('del = ?');
      updateValues.push(del);
    }
    if (dt !== undefined) {
      updateFields.push('dt = ?');
      updateValues.push(dt);
    }
    if (user !== undefined && user !== '') {
      updateFields.push('user = ?');
      updateValues.push(user);
    }

    // If no fields are provided, return an error
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided for update',
      });
    }

    const query = `
      UPDATE users_details
      SET ${updateFields.join(', ')}
      WHERE user_id IN (
          SELECT id
          FROM users
          WHERE email = ?
      );
    `;

    // Add email to the update values
    updateValues.push(email);

    // Use a promise wrapper to make the MySQL query asynchronous
    const results = await new Promise((resolve, reject) => {
      mysqlConnection.query(query, updateValues, (error, results) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(results);
      });
    });

    // console.log(results); // Adjust this based on how you want to handle the results
    res.status(200).json({ success: true, message: 'User details updated', results });
  } catch (error) {
    console.error('Error executing MySQL query:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error });
  }
};

module.exports = { UserDetails, createUserDetails,updateUserDetails };
