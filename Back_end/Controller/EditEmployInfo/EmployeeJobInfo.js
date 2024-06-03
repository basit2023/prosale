const mysqlConnection = require('../../utils/database');

const EmpOfficeDetails = async (req, res) => {
  try {
    // Retrieve the user email from the request query parameters
    const id = req.params.id;

    

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user email',
      });
    }

    const query = `
  SELECT
    uj.id,
    uj.user_id,
    uj.offices,
    uj.day_off,
    uj.time_in,
    uj.time_out,
    uj.dt,
    uj.del,
    GROUP_CONCAT(uo.name) AS office_names,
    uj.user
  FROM
    users_jobs uj
  JOIN
    users_offices uo ON FIND_IN_SET(uo.id, uj.offices) > 0
  WHERE
    uj.user_id IN (SELECT id FROM users WHERE id = ?)
  GROUP BY
    uj.id, uj.user_id, uj.offices, uj.day_off, uj.time_in, uj.time_out, uj.dt, uj.del, uj.user;
`;

     

    const results = await new Promise((resolve, reject) => {
      mysqlConnection.query(query, [id], (error, results) => {
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



//off days
const AllDays = async (req, res) => {
  try {
    // Use a connection pool to handle connections
    const [rows, fields] = await mysqlConnection.promise().query('SELECT * FROM soft_days');

    // Respond with user information
    res.status(200).json({
      success: true,
      message: 'All days fetched successfully',
      
        alldays: rows,
        
    });
  } catch (error) {
    console.error('Error fetching all days:', error);
    res.status(500).json({
      success: false,
      message: 'Error in fetching all days',
      error: error.message,
    });
  }
};
const AllOffices = async (req, res) => {
  try {
    // Use a connection pool to handle connections
    const [rows, fields] = await mysqlConnection.promise().query('SELECT name FROM users_offices');

    // Extract names from the result
    const officeNames = rows.map(office => office.name);

    // Respond with office names array
    res.status(200).json({
      success: true,
      message: 'All offices fetched successfully',
      alloffices: officeNames,
    });
  } catch (error) {
    console.error('Error fetching all offices:', error);
    res.status(500).json({
      success: false,
      message: 'Error in fetching all offices',
      error: error.message,
    });
  }
};

//update the job information
const UpdateEmpOfficeandjobDetails = async (req, res) => {
  try {
    const user_id = req.params.id;


    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user_id',
      });
    }


    // Extract the fields from the request body
    let { offices, day_off, time_in, time_out, dt, del, user } = req.body;

    // Convert time_in and time_out to the desired format
    if (time_in) {
      const inDate = new Date(time_in);
      time_in = inDate.toLocaleTimeString('en-US', {
        hour12: true,
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'Asia/Karachi',
      });
      
    }

    if (time_out) {
      const outDate = new Date(time_out);
      time_out = outDate.toLocaleTimeString('en-US', {
        hour12: true,
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'Asia/Karachi',
      });
    
    }

    
    // Build the UPDATE query for users_jobs
    // const updateQuery = `
    //   UPDATE users_jobs
    //   SET
    //     offices = IFNULL(?, offices),
    //     day_off = IFNULL(?, day_off),
    //     time_in = IFNULL(?, time_in),
    //     time_out = IFNULL(?, time_out),
    //     dt = IFNULL(?, dt),
    //     del = IFNULL(?, del),
    //     user = IFNULL(?, user)
    //   WHERE
    //     user_id = ?;
    // `;
    let sql = 'UPDATE users_jobs SET ';
    const values=[];
    if (offices !== undefined && offices !== '') {
      sql += 'offices = ?, ';
      values.push(offices);
    }
    if (day_off !== undefined && day_off !== '') {
      sql += 'day_off = ?, ';
      values.push(day_off);
    }
    if (time_in !== undefined && time_in !== '') {
      sql += 'time_in = ?, ';
      values.push(time_in);
    }
    if (time_out !== undefined && time_out !== '') {
      sql += 'time_out = ?, ';
      values.push(time_out);
    }
    if (dt !== undefined && dt !== '') {
      sql += 'dt = ?, ';
      values.push(dt);
    }
    if (del !== undefined && del !== '') {
      sql += 'del = ?, ';
      values.push(del);
    }
    if (user !== undefined && user !== '') {
      sql += 'user = ?, ';
      values.push(user);
    }
    sql = sql.slice(0, -2) + ' WHERE user_id = ?';
      values.push(user_id);

      mysqlConnection.query(sql, values, (error, results) => {
        if (error) {
          console.error('Error updating job infodata:', error);
          res.status(500).json({ error: 'Error updating job info. Please try again.' });
        } else {
          res.status(200).json({ success: true, message: 'Job Info updated successfully!' });
        }
      });
    } catch (error) {
      console.error('Error while updating user information:', error);
      res.status(500).json({ success: false, error: 'Error updating profile. Please try again.' });
    }

  //   const updateParams = [offices, day_off, time_in, time_out, dt, del, user, id];

  //   // Execute the UPDATE query for users_jobs
  //   await new Promise((resolve, reject) => {
  //     mysqlConnection.query(updateQuery, updateParams, async (error, results) => {
  //       if (error) {
  //         reject(error);
  //         return;
  //       }

  //       resolve(results);
  //       console.log("The result of update job:", results);
  //     });
  //   });

  //   res.status(200).json({ success: true, message: "User details updated successfully" });
  // } catch (error) {
  //   console.error('Error executing MySQL query:', error);
  //   res.status(500).json({ success: false, message: "Internal Server Error", error });
  // }
};






//update the job and office information
const CreateEmpOfficeJobDetails = async (req, res) => {
  try {
    // Retrieve the user id from the request parameters
    const user_id = req.params.id; // Assign the id from req.params to user_id

  

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user id',
      });
    }

    // Extract the fields from the request body
    let { offices, dayoff, time_in, time_out, dt, del, user } = req.body; // Use let instead of const
    let day_off=dayoff;
    if (time_in) {
      const inDate = new Date(time_in);
      time_in = inDate.toLocaleTimeString('en-US', {
        hour12: true,
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'Asia/Karachi',
      });
     
    }

    if (time_out) {
      const outDate = new Date(time_out);
      time_out = outDate.toLocaleTimeString('en-US', {
        hour12: true,
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'Asia/Karachi',
      });
      
    }



    // Build the INSERT query
    const insertQuery = `
      INSERT INTO users_jobs (user_id, offices, day_off, time_in, time_out, dt, del, user)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const insertParams = [user_id, offices, day_off, time_in, time_out, dt, del, user];

    // Execute the INSERT query
    const results = await new Promise((resolve, reject) => {
      mysqlConnection.query(insertQuery, insertParams, (error, results) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(results);
      });
    });

   
    res.status(200).json({ success: true, message: "Employee job info created successfully", results });
  } catch (error) {
    console.error('Error executing MySQL query:', error);
    res.status(500).json({ success: false, message: "Internal Server Error", error });
  }
};




module.exports = { EmpOfficeDetails,AllDays,AllOffices,UpdateEmpOfficeandjobDetails,CreateEmpOfficeJobDetails };
