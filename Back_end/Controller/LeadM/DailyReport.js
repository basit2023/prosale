const mysqlConnection = require('../../utils/database');

const DailyReport = async (req, res) => {
    try {
        const { user } = req.params;
        const { permission, id } = req.query;
        console.log("the permission and the id is:", permission, id);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User parameter is required'
            });
        }

        let query;
        let queryParams = [];

        if (permission >= 9) {
            // Permission 9+ - get all data
            query = `
                SELECT 
                    lcr.id,
                    CONCAT(u.first_name, ' ', u.last_name) as full_name, 
                    lcr.daily_office_visits, 
                    lcr.client_matured, 
                    lcr.daily_lead_follow_up, 
                    lcr.lead_assigned, 
                    lcr.dealers_meeting, 
                    lcr.dealers_register, 
                    lcr.office_activity, 
                    lcr.user, 
                    lcr.del,
                    lcr.dt
                FROM leads_activity_report lcr
                INNER JOIN users u ON lcr.user = u.name
                WHERE u.del = 'N' AND lcr.del = 'N'
                ORDER BY lcr.id DESC
            `;
        } else if (permission >= 5) {
            // Permission 5-8 - get data for users in the manager's zone plus the current user
            const [managerResults] = await mysqlConnection
                .promise()
                .query(`
                    SELECT u.name 
                    FROM users_zones as z 
                    INNER JOIN users_teams as ut ON z.id = ut.zone_id 
                    INNER JOIN users as u ON ut.id = u.assigned_team 
                    WHERE z.zonal_manager = ?
                    UNION
                    SELECT name FROM users WHERE id = ?
                `, [id, id]);

            if (managerResults.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No users found under this zonal manager'
                });
            }

            const userNames = managerResults.map(user => user.name);
            query = `
                SELECT 
                    lcr.id,
                    CONCAT(u.first_name, ' ', u.last_name) as full_name, 
                    lcr.daily_office_visits, 
                    lcr.client_matured, 
                    lcr.daily_lead_follow_up, 
                    lcr.lead_assigned, 
                    lcr.dealers_meeting, 
                    lcr.dealers_register, 
                    lcr.office_activity, 
                    lcr.user, 
                    lcr.del,
                    lcr.dt
                FROM leads_activity_report lcr
                INNER JOIN users u ON lcr.user = u.name
                WHERE lcr.user IN (?) AND u.del = 'N' AND lcr.del = 'N'
                ORDER BY lcr.id DESC
            `;
            queryParams = [userNames];
        } else if (permission == 4) {
            // Permission 4 - get data for users in the manager's team plus the current user
            const [teamResults] = await mysqlConnection
                .promise()
                .query(`
                    SELECT u.name 
                    FROM users_teams as t 
                    INNER JOIN users as u ON t.id = u.assigned_team 
                    WHERE t.manager_id = ?
                    UNION
                    SELECT name FROM users WHERE id = ?
                `, [id, id]);

            if (teamResults.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No users found under this team manager'
                });
            }

            const userNames = teamResults.map(user => user.name);
            query = `
                SELECT 
                    lcr.id,
                    CONCAT(u.first_name, ' ', u.last_name) as full_name, 
                    lcr.daily_office_visits, 
                    lcr.client_matured, 
                    lcr.daily_lead_follow_up, 
                    lcr.lead_assigned, 
                    lcr.dealers_meeting, 
                    lcr.dealers_register, 
                    lcr.office_activity, 
                    lcr.user, 
                    lcr.del,
                    lcr.dt
                FROM leads_activity_report lcr
                INNER JOIN users u ON lcr.user = u.name
                WHERE lcr.user IN (?) AND u.del = 'N' AND lcr.del = 'N'
                ORDER BY lcr.id DESC
            `;
            queryParams = [userNames];
        } else {
            // Permission <4 - get data only for the specific user
            query = `
                SELECT 
                    lcr.id,
                    CONCAT(u.first_name, ' ', u.last_name) as full_name, 
                    lcr.daily_office_visits, 
                    lcr.client_matured, 
                    lcr.daily_lead_follow_up, 
                    lcr.lead_assigned, 
                    lcr.dealers_meeting, 
                    lcr.dealers_register, 
                    lcr.office_activity, 
                    lcr.user, 
                    lcr.del,
                    lcr.dt
                FROM leads_activity_report lcr
                INNER JOIN users u ON lcr.user = u.name
                WHERE lcr.user = ? AND u.del = 'N' AND lcr.del = 'N'
                ORDER BY lcr.id DESC
            `;
            queryParams = [user];
        }

        const [results] = await mysqlConnection
            .promise()
            .query(query, queryParams);

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No daily activity found'
            });
        }

        const userReports = results.map(report => ({
            id: report.id,
            daily_office_visits: report.daily_office_visits,
            client_matured: report.client_matured,
            daily_lead_follow_up: report.daily_lead_follow_up,
            lead_assigned: report.lead_assigned,
            dealers_meeting: report.dealers_meeting,
            dealers_register: report.dealers_register,
            office_activity: report.office_activity,
            user: report.user,
            del: report.del,
            full_name: report.full_name,
            dt: report.dt
        }));

        res.status(200).json({
            success: true,
            message: 'Daily Activity Reports fetched successfully',
            data: userReports
        });

    } catch (error) {
        console.error('Error fetching daily activity report:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching daily activity report',
            error: error.message
        });
    }
};
const fullReport = async (req, res) => {
    try {
        const { from, to } = req.query;
   

        if (!from || !to) {
            return res.status(400).json({
                success: false,
                message: 'From and To date parameters are required'
            });
        }

        // Format for MySQL
        const fromDateTime = `${from} 00:00:00`;
        const toDateTime = `${to} 23:59:59`;

        

        // Fetch users
        const [users] = await mysqlConnection.promise().query(`
            SELECT 
                id,
                name AS username,
                CONCAT(first_name, ' ', last_name) AS full_name
            FROM users 
            WHERE del = 'N'
            ORDER BY full_name
        `);

        // Filter out invalid users
        const validUsers = users.filter(user => user.username.trim() !== '' && user.full_name.trim() !== '');


        
 
        

        // Fetch reports
        const [reports] = await mysqlConnection.promise().query(`
            SELECT 
                lcr.id,
                lcr.user AS username,
                CONCAT(u.first_name, ' ', u.last_name) AS full_name, 
                lcr.daily_office_visits, 
                lcr.client_matured, 
                lcr.daily_lead_follow_up, 
                lcr.lead_assigned, 
                lcr.dealers_meeting, 
                lcr.dealers_register, 
                lcr.office_activity, 
                DATE(lcr.dt) AS report_date
            FROM leads_activity_report lcr
            JOIN users u ON lcr.user = u.name
            WHERE lcr.del = 'N' 
              AND u.del = 'N'
              AND lcr.dt BETWEEN ? AND ?
            ORDER BY lcr.dt DESC, full_name
        `, [fromDateTime, toDateTime]);

   
        

        // Group reports by normalized date and username
        const groupedByDate = {};
        reports.forEach(report => {
            const date = report.report_date.toLocaleDateString('en-CA'); // safe, local, ISO-style

            const username = report.username.trim().toLowerCase();
            if (!groupedByDate[date]) {
                groupedByDate[date] = {};
            }
            groupedByDate[date][username] = report;
        });

    

        // Generate date range array
        const dateRange = [];
        let current = new Date(from);
        const end = new Date(to);

        while (current <= end) {
            const formattedDate = current.toISOString().split('T')[0];
            dateRange.push(formattedDate);
            current.setDate(current.getDate() + 1);
        }



        // Build final report
        const finalReport = dateRange.map(date => ({
            date,
            activities: validUsers.map(user => {
                const username = user.username.trim().toLowerCase();
                const report = groupedByDate[date]?.[username];

                return {
                    id: report?.id || null,
                    user_id: user.id,
                    username: user.username,
                    full_name: user.full_name,
                    report_date: date,
                    daily_office_visits: report?.daily_office_visits ?? 0,
                    client_matured: report?.client_matured ?? 0,
                    daily_lead_follow_up: report?.daily_lead_follow_up ?? 0,
                    lead_assigned: report?.lead_assigned ?? 0,
                    dealers_meeting: report?.dealers_meeting ?? 0,
                    dealers_register: report?.dealers_register ?? 0,
                    office_activity: report?.office_activity ?? 'N/A'
                };
            })
        }));



        res.status(200).json({
            success: true,
            message: 'Full report fetched successfully',
            data: finalReport
        });

    } catch (error) {
        console.error('Error in fullReport:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while generating report',
            error: error.message
        });
    }
};





module.exports = { DailyReport, fullReport };