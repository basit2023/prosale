const mysqlConnection = require('../../utils/database');
const getAllCompany = async (req, res) => {
    try {
        // Extract email from the request parameters
        const { email } = req.params;

        // Validate email parameter
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email parameter',
            });
        }

        // Fetch user information from the database
        const [user] = await mysqlConnection.promise().query('SELECT user_type, name, company_id FROM users WHERE email = ?', [email]);
        const [rows] = await mysqlConnection.promise().query(`SELECT id, title FROM companies where company_creator=?`,[user[0].name]);
        // Check if user exists
        if (!user.length) {
            return res.status(404).json({
                success: false,
                message: 'Email is not registered',
            });
        }

        
        if (user[0].user_type !== "super_admin") {
            // Split company_id by comma and find the length
            
            
            // Prepare user data with modified properties
            const userData = {
                number: user.length,
                company_id: user[0].company_id
            };
            
            // Send response with modified user data
            return res.status(200).json({
                success: true,
                message: 'User Info fetched successfully',
                user_data: userData,
            });
        } else {
            // Fetch company information from the database
          
            if(rows.length<=1){
                const userData = {
                    number: rows.length,
                    company_id: user[0].company_id
                };
                console.log("the data is:", userData)
                // Send response with modified user data
                return res.status(200).json({
                    success: true,
                    message: 'User Info fetched successfully',
                    user_data: userData,
                });
            }
            
            
            const companyData = rows.map(row => ({
                name: row.title,
                value: row.id
            }));
            
            // Send response with company data
            return res.status(200).json({
                success: true,
                message: 'Company Info fetched successfully',
                company_data: companyData,
                user_data: {number:rows.length},
            });
        }
    } catch (error) {
        console.error('Error fetching user/company info:', error);
        return res.status(500).json({
            success: false,
            message: 'Error in fetching user/company info',
            error: error.message,
        });
    }
};



const GetCompanies = async (req, res) => {
    try {
      const { email } = req.query;
     
  
      // Fetch company_id for the given email
      const [userRows] = await mysqlConnection.promise().query('SELECT company_id FROM users WHERE email = ?', [email]);
  
      if (userRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No user found with the provided email',
          data: []
        });
      }
  
      const companyIds = userRows[0].company_id;
      if (!companyIds) {
        return res.status(404).json({
          success: false,
          message: 'No companies associated with this user',
          data: []
        });
      }
  
      // Fetch companies with the fetched company_ids
      const [rows] = await mysqlConnection.promise().query('SELECT id, title FROM companies WHERE FIND_IN_SET(id, ?)', [companyIds]);
  
      const data = rows.map(row => ({
        name: row.title,
        value: row.id
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
  
  const GetSingleCompany = async (req, res) => {
    try {
      const { id } = req.query;
  
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Company ID is required',
          data: []
        });
      }
  
      // Fetch company with the given id
      const [rows] = await mysqlConnection.promise().query('SELECT id, title FROM companies WHERE id = ?', [id]);
  
      if (rows.length === 0) {
        return;
        // res.status(404).json({
        //   success: false,
        //   message: 'No company found with the provided ID',
        //   data: []
        // });
      }
  
      const data = rows.map(row => ({
        name: row.title,
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
  


module.exports = { getAllCompany, GetCompanies,GetSingleCompany};
