
const mysqlConnection = require('../../utils/database');

const GetEmpStatus = async (req, res) => {
  try {
    const { id } = req.params; 

    const [user] = await mysqlConnection.promise().query('SELECT * FROM users WHERE id = ?', [id]);

    if (!user.length) {
      return res.status(404).json({
        success: false,
        message: 'User id is not found',
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

const UpdateStatusInfo = async (req, res) => {
  try {
    const id = req.params.id;


    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user_id',
      });
    }

    // Extract the fields from the request body
    let { sms, lead_status,dt} = req.body;


    let sql = 'UPDATE users SET ';
    const values = [];

   
    if (sms !== undefined && sms !== '') {
      sql += 'sms = ?, ';
      values.push(sms);
    }
    if (lead_status !== undefined && lead_status !== '') {
      sql += 'lead_status = ?, ';
      values.push(lead_status);
    }
    if (dt !== undefined && dt !== '') {
      sql += 'dt = ?, ';
      values.push(dt);
    }


    // Remove the trailing comma and space
    sql = sql.slice(0, -2) + ' WHERE id = ?';
    values.push(id);

    mysqlConnection.query(sql, values, (error, results) => {
      if (error) {
        console.error('Error updating Lead & SMS info data:', error);
        res.status(500).json({ error: 'Error updating Vault info. Please try again.' });
      } else {
        res.status(200).json({ success: true, message: 'Lead & SMS Info updated successfully!' });
      }
    });
  } catch (error) {
    console.error('Error while updating Lead & SMS information:', error);
    res.status(500).json({ success: false, error: 'Error updating Lead & SMS info. Please try again.' });
  }
};


  module.exports = { GetEmpStatus,UpdateStatusInfo};
