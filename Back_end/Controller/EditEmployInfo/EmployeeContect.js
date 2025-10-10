const mysqlConnection = require('../../utils/database');


const GetEmployeeContectInfo = async (req, res) => {
    try {
      // Retrieve the user email from the request query parameters
      const id = req.params.id;
  
      // console.log("the user id is from query parameters-->:", id);
  
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user email',
        });
      }
  
      const query = `
    SELECT
      *
    FROM
    users_contracts 
    WHERE
      user_id IN (SELECT id FROM users WHERE id = ?)
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


  //get contract types
  const GetContracts = async (req, res) => {
    try {
      // Use a connection pool to handle connections
      const [rows, fields] = await mysqlConnection.promise().query('SELECT type FROM users_contracts_types');
  
      // Extract names from the result
      const officeNames = rows.map(office => office.type);
  
      // Respond with office names array
      res.status(200).json({
        success: true,
        message: 'All offices fetched successfully',
        contracts: officeNames,
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


  const UpdateEmpContectInfo = async (req, res) => {
    try {
      const user_id = req.params.id;
  
  
      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user_id',
        });
      }
      
 
      // Extract the fields from the request body
      let { id, doj, contract_type,contract_duration,
        allocated_leaves,probation_status, probation_duration,
         dt, del, user,offer_letter } = req.body;
  
     if(offer_letter=='Yes'){
      offer_letter=`offer_letter_userid_${user_id}.pdf`;
     }else{
      offer_letter=''
     }
      let sql = 'UPDATE users_contracts SET ';
      const values=[];
      if (doj !== undefined && doj !== '') {
        sql += 'doj = ?, ';
        values.push(doj);
      }
      if (contract_type !== undefined && contract_type !== '') {
        sql += 'contract_type = ?, ';
        values.push(contract_type);
      }
      if (contract_duration !== undefined && contract_duration !== '') {
        sql += 'contract_duration = ?, ';
        values.push(contract_duration);
      }
      if (allocated_leaves !== undefined && allocated_leaves !== '') {
        sql += 'allocated_leaves = ?, ';
        values.push(allocated_leaves);
      }
      if (probation_status !== undefined && probation_status !== '') {
        sql += 'probation_status = ?, ';
        values.push(probation_status);
      }
      if (probation_duration !== undefined && probation_duration !== '') {
        sql += 'probation_duration = ?, ';
        values.push(probation_duration);
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
      if (offer_letter !== undefined && offer_letter !== '') {
        sql += 'offer_letter = ?, ';
        values.push(offer_letter);
      }
      sql = sql.slice(0, -2) + ' WHERE user_id = ?';
        values.push(user_id);
  
        mysqlConnection.query(sql, values, (error, results) => {
          if (error) {
            console.error('Error updating contect info data:', error);
            res.status(500).json({ error: 'Error updating contect info. Please try again.' });
          } else {
            res.status(200).json({ success: true, message: 'Contect Info updated successfully!' });
          }
        });
      } catch (error) {
        console.error('Error while updating Contect information:', error);
        res.status(500).json({ success: false, error: 'Error updating Contect info. Please try again.' });
      }
 
  };


  //create job info
  //update the job and office information
const CreateEmpJobInfo = async (req, res) => {
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
    let { doj, contract_type,contract_duration,
      allocated_leaves,probation_status, probation_duration,
       dt, del, user,offer_letter } = req.body;
       if(offer_letter=='Yes'){
        offer_letter=`offer_letter_userid_${user_id}.pdf`;
       }else{
        offer_letter=''
       }
  //  console.log("the offer letter is:",offer_letter)
   let dir='employee_contracts';
   let page_count='2 pages'

    // Build the INSERT query
    const insertQuery = `
  INSERT INTO users_contracts (user_id, contract_type, contract_duration, 
    probation_status, probation_duration, allocated_leaves, doj, dir, offer_letter, dt, del, user)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
`;

const insertParams = [user_id, contract_type, contract_duration, 
  probation_status, probation_duration, allocated_leaves, doj, dir, offer_letter, dt, del, user];
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

 const CreateTargetRevenue = async (req, res) => {
  try {
    const { id } = req.query;  // Extract 'id' from the query
    const { designation, targetRevenue, achievedRevenue } = req.body;

    // If `id` is provided in the query, update only that user's target and achieved revenue
    if (id) {
      const [result] = await mysqlConnection
        .promise()
        .execute(
          `
          UPDATE users
          SET targetRevenue = ?, achievedRevenue = ?
          WHERE del = 'N' AND id = ?
          `,
          [targetRevenue, achievedRevenue, id]
        );

      // Check if any rows were affected and return a success message
      if (result.affectedRows > 0) {
        return res.status(200).json({
          success: true,
          message: `Updated targetRevenue and achievedRevenue for user with id ${id}.`,
          affectedRows: result.affectedRows,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: `No user found with id ${id} or the user is marked as deleted.`,
        });
      }
    }

    // If `id` is not provided, update based on designation
    // Basic validation for `designation`
    if (!designation || typeof designation !== 'string') {
      return res.status(400).json({ success: false, message: 'designation is required (string)' });
    }

    // Validate `targetRevenue`
    const parsedRevenue = Number(targetRevenue);
    if (!Number.isFinite(parsedRevenue)) {
      return res.status(400).json({ success: false, message: 'targetRevenue must be a valid number' });
    }

    // Optional: clamp negative values to 0 (or remove if you allow negatives)
    const valueToSet = parsedRevenue < 0 ? 0 : parsedRevenue;

    // Update users table for a given designation
    const [result] = await mysqlConnection
      .promise()
      .execute(
        `
        UPDATE users
        SET targetRevenue = ?
        WHERE del = 'N' AND designation = ?
        `,
        [valueToSet, designation]
      );

    return res.status(200).json({
      success: true,
      message:
        result.affectedRows > 0
          ? `Updated targetRevenue for ${result.affectedRows} user(s) with designation: ${designation}.`
          : 'No users matched the given designation with del = N.',
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error('Error executing MySQL query:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error });
  }
};

  
  
module.exports = { GetEmployeeContectInfo,GetContracts, UpdateEmpContectInfo,CreateEmpJobInfo,CreateTargetRevenue };
