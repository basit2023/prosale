const mysqlConnection = require('../../utils/database');

const EditLeadCustomer = async (req, res) => {
    try {
      const { id } = req.params; 
  
      const [user] = await mysqlConnection.promise().query('SELECT * FROM leads_customers WHERE id = ?', [id]);
  
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
          full_name: user[0].full_name,
          mobile: user[0].mobile,
          whatsapp: user[0].whatsapp,
          email: user[0].email,
          job_title: user[0].job_title,
          city: user[0].city,
          type: user[0].type,
          country: user[0].country,
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

  const UpdateLeadCustomer = async (req, res) => {
    try {
      const { id } = req.params; // Assume id is passed correctly
  
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ID',
        });
      }
  
      // Extract fields from the request body
      const { full_name, mobile, whatsapp, email, job_title, city, type, country, dt } = req.body;
  
      let sql = 'UPDATE leads_customers SET ';
      const values = [];
  
      // For each field, check if it is undefined or an empty string, then add it to the query
      if (full_name !== undefined && full_name !== '') {
        sql += 'full_name = ?, ';
        values.push(full_name);
      }
      if (mobile !== undefined && mobile !== '') {
        sql += 'mobile = ?, ';
        values.push(mobile);
      }
      if (whatsapp !== undefined && whatsapp !== '') {
        sql += 'whatsapp = ?, ';
        values.push(whatsapp);
      }
      if (email !== undefined && email !== '') {
        sql += 'email = ?, ';
        values.push(email);
      }
      if (job_title !== undefined && job_title !== '') {
        sql += 'job_title = ?, ';
        values.push(job_title);
      }
      if (city !== undefined && city !== '') {
        sql += 'city = ?, ';
        values.push(city);
      }
      if (type !== undefined && type !== '') {
        sql += 'type = ?, ';
        values.push(type);
      }
      if (country !== undefined && country !== '') {
        sql += 'country = ?, ';
        values.push(country);
        if(country=="92"){
          const type="local"
          sql += 'type = ?, ';
          values.push(type);
        }else{
          const type="international"
          sql += 'type = ?, ';
          values.push(type);
        }
      }
      if (dt !== undefined && dt !== '') {
        sql += 'dt = ?, ';
        values.push(dt);
      }
      
  
      // Check if no fields were provided for update
      if (values.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields provided for update',
        });
      }
  
      // Remove the trailing comma and space, then add WHERE clause
      sql = sql.slice(0, -2) + ' WHERE id = ?';
      values.push(id);
  
      // Execute the query
      const [result] = await mysqlConnection.promise().query(sql, values);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Lead customer not found',
        });
      }
  
      res.status(200).json({
        success: true,
        message: 'Lead customer updated successfully',
      });
    } catch (error) {
      console.error('Error updating lead customer:', error);
      res.status(500).json({
        success: false,
        message: 'Error in updating lead customer',
        error: error.message,
      });
    }
  };
  const CreateLeadCustomer = async (req, res) => {
    try {
      // Extract fields from the request body
      const { full_name, mobile, whatsapp, email, job_title, city, country, dt, company_id } = req.body;
      const type = country === "92" ? "local" : "international";
  
      // Check if required fields are provided
      if (!full_name || !mobile) {
        return res.status(400).json({
          success: false,
          message: 'Please provide full_name and mobile for the new customer',
        });
      }
  
      const existingCustomer = await mysqlConnection.promise().query(
        'SELECT * FROM leads_customers WHERE mobile = ?',
        [mobile]
      );
  
      if (existingCustomer[0].length > 0) {
        // If email or mobile number already exists, return error response
        return res.status(400).json({
          success: false,
          message: 'Mobile number already exists. Please try with another.',
        });
      }
  
      const sql = `
        INSERT INTO leads_customers (full_name, mobile, whatsapp, email, job_title, city, type, country, dt, company_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
          company_id = CASE 
            WHEN company_id IS NULL THEN VALUES(company_id)
            ELSE CONCAT(company_id, ',', VALUES(company_id))
          END
      `;
  
      const values = [full_name, mobile, whatsapp, email, job_title, city, type, country, dt, company_id];
  
      // Execute the query
      const [result] = await mysqlConnection.promise().query(sql, values);
  
      // Check if the customer was successfully inserted
      if (result.affectedRows === 0) {
        return res.status(500).json({
          success: false,
          message: 'Failed to create lead customer',
        });
      }
  
      // Return success response
      res.status(201).json({
        success: true,
        message: 'Lead customer created successfully',
        customer_id: result.insertId,
      });
    } catch (error) {
      console.error('Error creating lead customer:', error);
      res.status(500).json({
        success: false,
        message: 'Error in creating lead customer',
        error: error.message,
      });
    }
  };
  
  const GetCustomerById = async (req, res) => {
    try {
      const { id } = req.params; 
      const [customer] = await mysqlConnection.promise().query(`
        SELECT
            lc.id,
            lc.full_name,
            lc.mobile,
            lc.whatsapp,
            lc.email,
            lc.job_title,
            lc.city,
            lc.type,
            lc.country,
            lc.dt
        FROM
            leads_customers AS lc
        WHERE
            lc.id = ?;
      `, [id]);
  
      if (!customer.length) {
        return res.status(200).json({
          success: true,
          message: 'No customer found',
        });
      }
  
      // Respond with the customer information
      res.status(200).json({
        success: true,
        message: 'Customer information fetched successfully',
        customer: customer[0], // Assuming there's only one customer with the given ID
      });
    } catch (error) {
      console.error('Error fetching customer information:', error);
      res.status(500).json({
        success: false,
        message: 'Error in fetching customer information',
        error: error.message,
      });
    }
  };
  
  
  const GetCountrycode = async (req, res) => {
    try {
        // Use a connection pool to handle connections
        const [rows, fields] = await mysqlConnection.promise().query('SELECT country_code FROM soft_countries');

        // Respond with an array of objects containing name and sign
        const data = rows.map(row => ({
            name: row.country_code,
            value: row.country_code
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
  

  module.exports = {GetCustomerById, EditLeadCustomer,UpdateLeadCustomer,GetCountrycode,CreateLeadCustomer};
