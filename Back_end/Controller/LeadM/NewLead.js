
const mysqlConnection = require('../../utils/database');

const GetSourceDepInterestLeadtype = async (req, res) => {
    try {
        const {company_id}=req.query;
        // Use a connection pool to handle connections
        const [rows] = await mysqlConnection.promise().query('SELECT id,platform FROM leads_source');
        const [rows1] = await mysqlConnection.promise().query('SELECT id,unit FROM inventory_type');
        const [rows2] = await mysqlConnection.promise().query(`
            SELECT id, name 
            FROM lead_projects 
            WHERE FIND_IN_SET(company_id, ?) > 0 
              AND status = "N";
        `, [company_id]);
        // Respond with an array of objects containing name and sign
        const data = rows.map(row => ({
            name: row.platform,
            value: String(row.id),
        }));
        const data1 = rows1.map(row => ({
            name: row.unit,
            value: String(row.id),
        }));
        const data2 = rows2.map(row => ({
            name: row.name,
            value: String(row.id),
        }));
     
        res.status(200).json({
            success: true,
            message: 'Data fetched successfully',
            data: data,
            data1:data1,
            data2:data2,
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({
            success: false,
            message: 'Error in fetching data',
            error: error.message,
        });
    }
}
const CreateNewLead = async (req, res) => {
    try {
        const {
            full_name, mobile, email, investment_budget, type, source, interested_in, company_id, project, remarks, dt, user
        } = req.body;

        if (!mobile) {
            return res.status(400).json({
                success: false,
                message: 'Mobile Number is required',
            });
        }

        // Check if mobile number already exists in leads_customers table for the given company_id
        const [existingCustomerRows] = await mysqlConnection.promise().query('SELECT * FROM leads_customers WHERE mobile = ? AND FIND_IN_SET(company_id, ?) > 0', [mobile, company_id]);

        let customerId;

        if (existingCustomerRows.length > 0) {

            customerId = existingCustomerRows[0].id;
        } else {
            // If customer doesn't exist, insert a new customer record
            const [insertCustomerResult] = await mysqlConnection.promise().query(`
                INSERT INTO leads_customers (
                    full_name, mobile, email, company_id, dt, type
                ) VALUES (?, ?, ?, ?, ?, ?)`, 
                [full_name, mobile, email, company_id, dt, type]
            );

            customerId = insertCustomerResult.insertId;
        }

        // Insert new lead into leads_main table
        const [insertLeadResult] = await mysqlConnection.promise().query(`
            INSERT INTO leads_main (
                customer, leads_source, project, interested_in, investment_budget, dt, company_id, user
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
            [customerId, source, project, interested_in, investment_budget, dt, company_id, user]
        );

        res.status(200).json({
            success: true,
            message: 'Lead created successfully',
            leadId: insertLeadResult.insertId,
            customerId: customerId
        });
    } catch (error) {
        console.error('Error creating lead:', error);
        res.status(500).json({
            success: false,
            message: 'Error in creating lead',
            error: error.message,
        });
    }
};


    module.exports = {GetSourceDepInterestLeadtype, CreateNewLead};
