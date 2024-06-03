
const mysqlConnection = require('../../utils/database');


const GetDessignation = async (req, res) => {
    try {
        // Use a connection pool to handle connections
        const [rows, fields] = await mysqlConnection.promise().query('SELECT designation FROM users_designations');

        // Respond with an array of objects containing name and sign
        const data = rows.map(row => ({
            name: row.designation,
            value: row.designation
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



const GetDepartment = async (req, res) => {
    try {
        // Use a connection pool to handle connections
        const [rows, fields] = await mysqlConnection.promise().query('SELECT department FROM users_departments');

        // Respond with an array of objects containing name and sign
        const data = rows.map(row => ({
            name: row.department,
            value: row.department
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



const GetUserType = async (req, res) => {
    try {
        // Use a connection pool to handle connections
        const [rows, fields] = await mysqlConnection.promise().query('SELECT type FROM users_types');

        // Respond with an array of objects containing name and sign
        const data = rows.map(row => ({
            name: row.type,
            value: row.type
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
const CreateUser = async (req, res) => {
    try {
        // console.log("the requiest body for the new user is:",req.body)
        const {cnic, department, designation, email,
            first_name,gender,  isp,last_name, mobile,name,password, user_type,image,
            lead_status,dt,del,sms,assigned_team,company_id
           } = req.body;
         let files_1= `data:image/jpeg;base64,${image}`
        // Check if email already exists
        const [existingUserRows] = await mysqlConnection.promise().query('SELECT * FROM users WHERE email = ?', [email]);

        if (existingUserRows.length > 0) {
            // Email already exists
            return res.status(400).json({
                success: false,
                message: 'Email already exists. Please try with another email.',
            });
        }

        // If email is unique, proceed to insert data
        const [insertResult] = await mysqlConnection.promise().query(`
        INSERT INTO users (
            cnic, department, designation, email, first_name, gender, isp, last_name, 
            mobile, name, password, user_type, files_1, lead_status, dt, del, sms, 
            assigned_team, company_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            company_id = CASE 
                WHEN company_id IS NULL THEN VALUES(company_id) 
                ELSE CONCAT(company_id, ',', VALUES(company_id)) 
            END
    `, [cnic, department, designation, email, first_name, gender, isp, last_name, mobile, 
        name, password, user_type, files_1, lead_status, dt, del, sms, assigned_team, company_id]);

        res.status(200).json({
            success: true,
            message: 'User created successfully',
            userId: insertResult.insertId,
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: 'Error in creating user',
            error: error.message,
        });
    }
};


module.exports = { GetDessignation,GetDepartment,GetUserType, CreateUser };
