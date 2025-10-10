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