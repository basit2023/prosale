const mysqlConnection = require('../../utils/database');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Track connected clients
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);

  ws.on('close', () => {
    clients.delete(ws);
  });
});

// Your existing database update logic...

// Notify clients when there's a change
const notifyClients = () => {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send('update');
    }
  });
};

const DeleteEmployee = async (req, res) => {
  try {
    // Extract fields from the request parameters and query
    const { id } = req.params;
    const { table, name,inactive } = req.query;
     console.log("table and the name are:",table, name)
    let sql = `UPDATE ${table} SET `;
    let values = [];

    // Assign hard-coded values
    const status = "Y";
    var del = "Y";
    if(inactive==="Yes"){
      var del="N"
    }
    
    if (table === "users") {
      sql += 'del = ?, ';
      values.push(del);
    } else if (table === "lead_projects") {
      sql += 'status = ?, ';
      values.push(status);
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid table name provided",
      });
    }

    // Remove the trailing comma and space
    sql = sql.slice(0, -2);

    // Add the WHERE clause to specify the employee to delete based on id
    sql += ' WHERE id = ?';
    values.push(id);

    // Execute the query
    await mysqlConnection.promise().query(sql, values);

    res.status(200).json({
      success: true,
      message: `${name} deleted successfully`,
    });
  } catch (error) {
    console.error(`Error deleting ${name}:`, error);
    return res.status(500).json({
      success: false,
      message: `Error in deleting ${name}`,
      error: error.message,
    });
  }
};




// const DeleteEmployee = async (req, res) => {
//   const userId = req.params.id;

//   try {
//     const selectQuery = 'SELECT del FROM users WHERE id = ?';
//     mysqlConnection.query(selectQuery, [userId], (error, results) => {
//       if (error) {
//         console.error('Error fetching del status:', error);
//         res.status(500).json({ success: false, error: 'Error updating del status. Please try again.' });
//       } else {
//         if(results[0].del== 'Y'){
//           return  res.status(200).json({ success: true, message: 'Already deleted!' });
//         }
//         const newDelStatus = results[0].del === 'N' ? 'Y' : 'Y';
//         const updateQuery = 'UPDATE users SET del = ? WHERE id = ?';
//         mysqlConnection.query(updateQuery, [newDelStatus, userId], (updateError, updateResults) => {
//           if (updateError) {
//             console.error('Error updating del status:', updateError);
//             res.status(500).json({ success: false, error: 'Error updating del status. Please try again.' });
//           } else {
//             notifyClients();
//             res.status(200).json({ success: true, message: 'Del status updated successfully!' });
//           }
//         });
//       }
//     });
//   } catch (error) {
//     console.error('Error in updateDelStatusHandler:', error);
//     res.status(500).json({ success: false, error: 'Error updating del status. Please try again.' });
//   }
// };

module.exports = {  DeleteEmployee };
