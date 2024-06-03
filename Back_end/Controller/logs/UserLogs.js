

const util = require('util');
const mysqlConnection = require('../../utils/database');
const os= require('os')
const { ip, ipv6, mac }=require('address');
const queryAsync = util.promisify(mysqlConnection.query).bind(mysqlConnection);

const UserLogs = async (req, res) => {
  try {
    const getNetworkAddresses = (familyType) => {
      const nets = os.networkInterfaces();
      const results = Object.create(null);
    
      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          if (net.family === familyType && !net.internal) {
            if (!results[name]) {
              results[name] = [];
            }
            results[name].push(net.address);
          }
        }
      }
      return results;
    };
    
    
    const networkAddresses = getNetworkAddresses('IPv4');
    // console.log("the address is:", networkAddresses);
    const ipAddress = (networkAddresses.WiFi && networkAddresses.WiFi[0]) || 'Unknown';

    // Wrap mac function in a promise
    const macAddress = await new Promise((resolve, reject) => {
      mac((err, address) => {
        if (err) {
          reject(err);
        } else {
          resolve(address);
        }
      });
    });

    // Set IP and MAC addresses on req
    req.ipAddress = ipAddress;
    req.macAddress = macAddress;

    const userDetails = req.body;
    
    // Create a new row in the users_logs table
    const query = 'INSERT INTO users_logs SET ?';
  
    // Include IP and MAC addresses in userDetails
    userDetails.ipAddress = ipAddress;
    userDetails.macAddress = macAddress;

    // Use queryAsync for async/await
    const results = await queryAsync(query, userDetails);

  
    res.status(201).json({ success: true, message: 'Logs created' });
  } catch (error) {
    console.error('Error creating logs:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};



//get all logs
const GetUserLogs = async (req, res) => {
    try {
      // Retrieve the user email from the query parameters
      const { email } = req.params;
  
  
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user email',
        });
      }


  
      const query = `
        SELECT *
        FROM users_logs
        WHERE user IN (
          SELECT name
          FROM users
          WHERE email = ?
        )
        ORDER BY dt DESC;
      `;
  
  
      // Use a promise wrapper to make the MySQL query asynchronous
      const results = await new Promise((resolve, reject) => {
        mysqlConnection.query(query, [email], (error, results) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(results);
        });
      });
      
      // console.log(results); // Adjust this based on how you want to handle the results
      res.status(200).json({ success: true, message: "User details", results });
    } catch (error) {
      console.error('Error executing MySQL query:', error);
      res.status(500).json({ success: false, message: "Internal Server Error", error });
    }
  };
module.exports = {UserLogs,GetUserLogs};
