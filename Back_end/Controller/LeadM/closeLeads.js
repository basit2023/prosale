const mysqlConnection = require('../../utils/database');
const ClosedLeadController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user lead id',
            });
        }

        let { meeting_location, meeting_time, customer, booking_file, closing_type, dt } = req.body;
        if (closing_type === "Y") {
            closing_type = "Meeting Initiated";
        } else if (closing_type === "N") {
            closing_type = "Matured";
        }

        // Declare formattedTime before the if block
        let formattedTime = ""; // Default value for formattedTime
        if (meeting_time) {
            const originalTime = new Date(meeting_time);
            const offset = 5 * 60 * 60 * 1000; // Pakistan is UTC+5
            const pakistaniTime = new Date(originalTime.getTime() + offset);
            formattedTime = pakistaniTime.toISOString().replace("T", " ").replace("Z", "");
            console.log("Formatted time:", formattedTime);
        } else {
            booking_file = `${id}-booking_file.pdf`;
        }

        const commentsArray = [];
        if (meeting_location) commentsArray.push(`Meeting Location: ${meeting_location}`);
        if (formattedTime) commentsArray.push(`Meeting Time: ${formattedTime}`);
        if (customer) commentsArray.push(`Customer: ${customer}`);
        if (booking_file) commentsArray.push(`Booking File: ${booking_file}`);

        const lead_id = id;
        const closing_details = commentsArray.join('\n');

        const insertQuery = `
        INSERT INTO leads_closing_details (lead_id, closing_details, closing_type, dt)
        VALUES (?, ?, ?, ?);
        `;

        const insertParams = [lead_id, closing_details, closing_type, dt];

        const results = await new Promise((resolve, reject) => {
            mysqlConnection.query(insertQuery, insertParams, (error, results) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(results);
            });
        });

        // Update leads_main table status to "close" where id is the same
        const updateQuery = 'UPDATE leads_main SET status = "close" WHERE id = ?';
        await new Promise((resolve, reject) => {
            mysqlConnection.query(updateQuery, [id], (error, results) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(results);
            });
        });

        res.status(200).json({ success: true, message: "Lead Closed successfully", results });
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        res.status(500).json({ success: false, message: "Internal Server Error", error });
    }
};

const ViewLead = async (req, res) => {
    try {
        const { id } = req.params;
        let { dt, email } = req.body;
       console.log("teh id email is:",id, email)

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user_id',
            });
        }

        const [rows, fields] = await mysqlConnection.promise().query(
            'SELECT view_dt,assigned_to FROM leads_main  WHERE id = ?',
            [id] // Use id instead of leads_label
        );
        const [user, fields1] = await mysqlConnection.promise().query(
            'SELECT name FROM users  WHERE email = ?',
            [email] // Use id instead of leads_label
        );

        if (!rows || !rows.length) {
            return res.status(404).json({
                success: false,
                message: 'Label not found',
            });
        }
        
     if(rows[0].assigned_to==user[0].name){
        // Check if view_dt is 'new_lead'
        if (rows[0].view_dt === 'new_lead') {
            let sql = 'UPDATE leads_main SET view_dt = ? WHERE id = ?';
            const values = [dt, id];

            await mysqlConnection.promise().query(sql, values);

            res.status(200).json({ success: true, message: 'view date updated successfully!' });
        } else {
            // Do nothing if view_dt is not 'new_lead'
            res.status(200).json({ success: true, message: 'view date not updated as it is not new_lead' });
        }
    }
    } catch (error) {
        console.error('Error while updating Label:', error);
        res.status(500).json({ success: false, error: 'Error updating view date. Please try again.' });
    }
};


module.exports = { ClosedLeadController,ViewLead };

