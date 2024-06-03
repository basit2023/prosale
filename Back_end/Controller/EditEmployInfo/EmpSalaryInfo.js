const mysqlConnection = require('../../utils/database');


const GetEmployeeSalaryInfo = async (req, res) => {
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
      *
    FROM
    users_salaries 
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

  const GetRupeOrPer = async (req, res) => {
    try {
        // Use a connection pool to handle connections
        const [rows, fields] = await mysqlConnection.promise().query('SELECT name, sign FROM soft_addon_types WHERE del = ?', ['N']);

        // Respond with an array of objects containing name and sign
        const data = rows.map(row => ({
            name: row.sign,
            sign: row.sign
        }));

        res.status(200).json({
            success: true,
            message: 'Data fetched successfully',
            data: data,
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({
            success: false,
            message: 'Error in fetching data',
            error: error.message,
        });
    }
};



//update salaray info
const UpdateEmpSalaryInfo = async (req, res) => {
  try {
    const user_id = req.params.id;

   
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user_id',
      });
    }

    // Extract the fields from the request body
    let {basic_salary, health_check, health_type, health_value,
      travel_check, travel_type, travel_value,
      food_check, food_type, food_value,
      overtime_check, overtime_type, overtime_value, overtime_per,
      commission_check, commission_type, commission_value
    } = req.body;


    let sql = 'UPDATE users_salaries SET ';
    const values = [];

    let salary=basic_salary;
    if (salary !== undefined && salary !== '') {
      sql += 'salary = ?, ';
      values.push(salary);
    }

    if (health_check !== undefined && health_check !== '') {
      sql += 'health_check = ?, ';
      values.push(health_check);
    }
    if (health_type !== undefined && health_type !== '') {
      sql += 'health_type = ?, ';
      values.push(health_type);
    }
    if (health_value !== undefined && health_value !== '') {
      sql += 'health_value = ?, ';
      values.push(health_value);
    }
    if (travel_check !== undefined && travel_check !== '') {
      sql += 'travel_check = ?, ';
      values.push(travel_check);
    }
    if (travel_type !== undefined && travel_type !== '') {
      sql += 'travel_type = ?, ';
      values.push(travel_type);
    }
    if (travel_value !== undefined && travel_value !== '') {
      sql += 'travel_value = ?, ';
      values.push(travel_value);
    }
    if (food_check !== undefined && food_check !== '') {
      sql += 'food_check = ?, ';
      values.push(food_check);
    }
    if (food_type !== undefined && food_type !== '') {
      sql += 'food_type = ?, ';
      values.push(food_type);
    }
    if (food_value !== undefined && food_value !== '') {
      sql += 'food_value = ?, ';
      values.push(food_value);
    }
    if (overtime_check !== undefined && overtime_check !== '') {
      sql += 'overtime_check = ?, ';
      values.push(overtime_check);
    }
    if (overtime_type !== undefined && overtime_type !== '') {
      sql += 'overtime_type = ?, ';
      values.push(overtime_type);
    }
    if (overtime_value !== undefined && overtime_value !== '') {
      sql += 'overtime_value = ?, ';
      values.push(overtime_value);
    }
    if (overtime_per !== undefined && overtime_per !== '') {
      sql += 'overtime_per = ?, ';
      values.push(overtime_per);
    }
    if (commission_check !== undefined && commission_check !== '') {
      sql += 'commission_check = ?, ';
      values.push(commission_check);
    }
    if (commission_type !== undefined && commission_type !== '') {
      sql += 'commission_type = ?, ';
      values.push(commission_type);
    }
    if (commission_value !== undefined && commission_value !== '') {
      sql += 'commission_value = ?, ';
      values.push(commission_value);
    }

    // Remove the trailing comma and space
    sql = sql.slice(0, -2) + ' WHERE user_id = ?';
    values.push(user_id);

    mysqlConnection.query(sql, values, (error, results) => {
      if (error) {
        console.error('Error updating contect info data:', error);
        res.status(500).json({ error: 'Error updating Salary info. Please try again.' });
      } else {
        res.status(200).json({ success: true, message: 'Salary Info updated successfully!' });
      }
    });
  } catch (error) {
    console.error('Error while updating Salary information:', error);
    res.status(500).json({ success: false, error: 'Error updating Salary info. Please try again.' });
  }
};

const CreateEmpSalaryInfo = async (req, res) => {
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
    let {basic_salary, health_check, health_type, health_value,
      travel_check, travel_type, travel_value,
      food_check, food_type, food_value,
      overtime_check, overtime_type, overtime_value, overtime_per,
      commission_check, commission_type, commission_value,dt, del, user
    } = req.body;
    // Build the INSERT query
    let salary=basic_salary
    const insertQuery = `
  INSERT INTO users_salaries (user_id, salary, health_check, health_type, health_value,
    travel_check, travel_type, travel_value,
    food_check, food_type, food_value,
    overtime_check, overtime_type, overtime_value, overtime_per,
    commission_check, commission_type, commission_value, dt, del, user)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
`;

const insertParams = [user_id, salary, health_check, health_type, health_value,
  travel_check, travel_type, travel_value,
  food_check, food_type, food_value,
  overtime_check, overtime_type, overtime_value, overtime_per,
  commission_check, commission_type, commission_value, dt, del, user];
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

   
    res.status(200).json({ success: true, message: "Employee Salary info created successfully", results });
  } catch (error) {
    console.error('Error executing MySQL query:', error);
    res.status(500).json({ success: false, message: "Internal Server Error", error });
  }
};


  

  module.exports = { GetEmployeeSalaryInfo,GetRupeOrPer,UpdateEmpSalaryInfo,CreateEmpSalaryInfo };
