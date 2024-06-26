const mysqlConnection = require('../../utils/database');

const getCounts = async (req, res) => {
  try {
    // Fetch total counts
    const [totalLeads] = await mysqlConnection.promise().query('SELECT COUNT(*) AS Total_Leads FROM leads_main');
    const [totalEmployees] = await mysqlConnection.promise().query('SELECT COUNT(*) AS Total_Employee FROM users');
    const [closeLeads] = await mysqlConnection.promise().query('SELECT COUNT(*) AS Close_Leads FROM leads_main WHERE status = "close"');
    const [totalProjects] = await mysqlConnection.promise().query('SELECT COUNT(*) AS Total_Projects FROM lead_projects');

    // Get the first and last day of last month
    const currentDate = new Date();
    const firstDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    // Convert dates to MySQL DATETIME format
    const firstDayOfLastMonthFormatted = firstDayOfLastMonth.toISOString().slice(0, 10);
    const lastDayOfLastMonthFormatted = lastDayOfLastMonth.toISOString().slice(0, 10);

    // Fetch last month's leads and closed leads counts
    const [lastMonthLeads] = await mysqlConnection.promise().query(
      'SELECT COUNT(*) AS LastMonthLeads FROM leads_main WHERE DATE(FROM_UNIXTIME(dt)) BETWEEN ? AND ?',
      [firstDayOfLastMonthFormatted, lastDayOfLastMonthFormatted]
    );
    const [lastMonthCloseLeads] = await mysqlConnection.promise().query(
      'SELECT COUNT(*) AS LastMonthCloseLeads FROM leads_main WHERE DATE(FROM_UNIXTIME(dt)) BETWEEN ? AND ? AND status = "close"',
      [firstDayOfLastMonthFormatted, lastDayOfLastMonthFormatted]
    );

    // Calculate the percentage of last month's leads and closed leads out of the total leads
    const totalLeadsCount = totalLeads[0].Total_Leads;
    const lastMonthLeadsCount = lastMonthLeads[0].LastMonthLeads;
    const lastMonthCloseLeadsCount = lastMonthCloseLeads[0].LastMonthCloseLeads;

    let lastMonthLeadsPercentage = 0;
    let lastMonthCloseLeadsPercentage = 0;

    if (totalLeadsCount > 0) {
      lastMonthLeadsPercentage = (lastMonthLeadsCount / totalLeadsCount) * 100;
      lastMonthCloseLeadsPercentage = (lastMonthCloseLeadsCount / totalLeadsCount) * 100;
    }

    // Fetch total new employees for the last month
    const [totalNewEmployees] = await mysqlConnection.promise().query(
      'SELECT COUNT(*) AS Total_New_Employees FROM users WHERE YEAR(dt) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH) AND MONTH(dt) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH)'
    );

    // Calculate the percentage of total new employees out of the total employees
    const totalEmployeesCount = totalEmployees[0].Total_Employee;
    const totalNewEmployeesCount = totalNewEmployees[0].Total_New_Employees;

    let totalNewEmployeesPercentage = 0;

    if (totalEmployeesCount > 0) {
      totalNewEmployeesPercentage = (totalNewEmployeesCount / totalEmployeesCount) * 100;
    }

    res.status(200).json({
      success: true,
      data: {
        Total_Leads: totalLeadsCount,
        Total_Employee: totalEmployeesCount,
        Close_Leads: closeLeads[0].Close_Leads,
        Total_Projects: totalProjects[0].Total_Projects,
        LastMonthLeads: lastMonthLeadsCount,
        LastMonthLeadsPercentage: lastMonthLeadsPercentage.toFixed(2), // Round to 2 decimal places
        LastMonthCloseLeads: lastMonthCloseLeadsCount,
        LastMonthCloseLeadsPercentage: lastMonthCloseLeadsPercentage.toFixed(2), // Round to 2 decimal places
        TotalNewEmployees: totalNewEmployeesCount,
        TotalNewEmployeesPercentage: totalNewEmployeesPercentage.toFixed(2) // Round to 2 decimal places
      },
    });
  } catch (error) {
    console.error('Error fetching counts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching counts',
      error: error.message,
    });
  }
};

const getTopLead = async (req, res) => {
 
  try {
    const [rows] = await mysqlConnection.promise().query(`
      SELECT 
          sub.month,
          CONCAT(u.first_name, ' ', u.last_name) AS employee,
          sub.lead_count
      FROM (
          SELECT 
              month,
              assigned_to,
              lead_count,
              @rank := IF(@current_month = month, @rank + 1, 1) AS rk,
              @current_month := month AS current_month
          FROM (
              SELECT 
                  DATE_FORMAT(FROM_UNIXTIME(assigned_on), '%Y-%m') AS month,
                  assigned_to,
                  COUNT(*) AS lead_count
              FROM leads_main
              WHERE assigned_on >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 12 MONTH))
              GROUP BY month, assigned_to
              ORDER BY month, lead_count DESC
          ) AS inner_query
          CROSS JOIN (SELECT @rank := 0, @current_month := '') AS vars
      ) AS sub
      JOIN users u ON sub.assigned_to = u.name
      WHERE sub.rk <= 4 
      ORDER BY sub.month, sub.rk;
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching lead counts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching top leads',
      error: error.message,
    });
  }
};

module.exports = { getCounts, getTopLead };


