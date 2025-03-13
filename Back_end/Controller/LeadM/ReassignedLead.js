// const mysqlConnection = require('../../utils/database');
// const WebSocket = require('ws');

// const wss = new WebSocket.Server({ port: 4001 });

// const sendWebSocketMessage = (event, data) => {
//   wss.clients.forEach((client) => {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(JSON.stringify({ event, data }));
//     }
//   });
// };

// const checkAndNotify = async (leadId, assignedTo, assignedThrough) => {
//   let notifyAssignedThrough = true;

//   const interval = setInterval(async () => {
//     try {
//       const [leadDetails] = await mysqlConnection.promise().query(
//         "SELECT view_dt FROM leads_main WHERE id = ?", 
//         [leadId]
//       );

//       if (leadDetails.length > 0 && leadDetails[0].view_dt !== "new_lead") {
//         console.log(`Lead ${leadId} viewed. Stopping reminders.`);
//         clearInterval(interval);
//         notifyAssignedThrough = false;
//       }

//       if (notifyAssignedThrough) {
//         console.log(`Reminder to ${assignedThrough} for lead ${leadId}`);
//         sendWebSocketMessage("lead_not_viewed", {
//           leadId,
//           message: `Lead ${leadId} still not viewed. Please check.`,
//         });
//       }
//     } catch (error) {
//       console.error("Error checking lead view status:", error);
//     }
//   }, 2 * 60 * 1000); // Check every 2 minutes
// };

// const ReassinedLead = async (req, res) => {
//   try {
//     const { ids, assigned_to, view_dt, assigned_on, assigned_through } = req.body;

//     if (!ids || !Array.isArray(ids) || ids.length === 0) {
//       return res.status(400).json({ success: false, message: 'Invalid lead IDs' });
//     }

//     // Update leads in database
//     let sql = `UPDATE leads_main SET assigned_to = ?, view_dt = ?, assigned_on = ?, assigned_through = ?, status = "open", leads_label = IF(leads_label = 12, 7, leads_label) WHERE id IN (?)`;
//     await mysqlConnection.promise().query(sql, [assigned_to, view_dt || "new_lead", assigned_on, assigned_through, ids]);

//     // Notify assigned_to in real-time
//     sendWebSocketMessage("lead_reassigned", { leadIds: ids, message: "New lead assigned!" });

//     // Start checking if the lead is not viewed in 2 minutes
//     setTimeout(() => {
//       ids.forEach((leadId) => checkAndNotify(leadId, assigned_to, assigned_through));
//     }, 2 * 60 * 1000);

//     res.status(200).json({ success: true, message: "Lead assigned successfully." });
//   } catch (error) {
//     console.error("Error assigning leads:", error);
//     res.status(500).json({ success: false, message: "Error assigning leads", error: error.message });
//   }
// };

// module.exports = { ReassinedLead };







// const mysqlConnection = require('../../utils/database');
// const WebSocket = require('ws'); 

// // Create a single WebSocket server instance outside the function
// const wss = new WebSocket.Server({ port: 4001 });

// const ReassinedLead = async (req, res) => {
//   try {
//     const { ids, assigned_to, view_dt, assigned_on, assigned_through } = req.body;

//     console.log("Lead reassignment request:", req.body);

//     if (!ids || !Array.isArray(ids) || ids.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid or empty IDs array',
//       });
//     }

//     // Fetch the assigning user details
//     const [assigningUser] = await mysqlConnection.promise().query(
//       "SELECT name, assigned_team FROM users WHERE email=?", 
//       [assigned_through]
//     );

//     if (!assigningUser.length) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid assigning user',
//       });
//     }

//     // Fetch the user who will receive the lead
//     const [assignedUser] = await mysqlConnection.promise().query(
//       "SELECT name, assigned_team FROM users WHERE id=?", 
//       [assigned_to]
//     );

//     if (!assignedUser.length) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid assigned user',
//       });
//     }

//     console.log("Assigned to:", assignedUser[0]);

//     // Update leads in database
//     let sql = 'UPDATE leads_main SET ';
//     const values = [];

//     sql += 'assigned_to = ?, ';
//     values.push(assignedUser[0].name);

//     sql += 'view_dt = ?, ';
//     values.push(view_dt || "new_lead");

//     sql += 'assigned_on = ?, ';
//     values.push(assigned_on);

//     sql += 'assigned_through = ?, ';
//     values.push(assigningUser[0].name);

//     sql += 'status = ?, ';
//     values.push("open");

//     sql += 'leads_label = IF(leads_label = 12, 7, leads_label), ';
//     sql = sql.slice(0, -2) + ' WHERE id IN (?)';
//     values.push(ids);

//     const [result] = await mysqlConnection.promise().query(sql, values);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'No leads were updated',
//       });
//     }

//     // Function to check if lead is not viewed
//     const checkViewDtAndNotify = async () => {
//       try {
//         const [leadDetails] = await mysqlConnection.promise().query(
//           "SELECT view_dt, assigned_through FROM leads_main WHERE id IN (?)", 
//           [ids]
//         );

//         if (leadDetails.length > 0) {
//           const { view_dt: leadViewDt, assigned_through: leadAssignedThrough } = leadDetails[0];

//           if (leadViewDt === "new_lead") {
//             wss.clients.forEach((client) => {
//               if (client.readyState === WebSocket.OPEN) {
//                 client.send(
//                   JSON.stringify({
//                     event: 'lead_not_viewed',
//                     data: {
//                       leadIds: ids,
//                       message: `Lead not viewed within 2 minutes. Please reassign.`,
//                     },
//                   })
//                 );
//               }
//             });

//             console.log(`Notification sent to ${leadAssignedThrough}`);
//           } else {
//             console.log("Lead was viewed. No notification needed.");
//           }
//         }
//       } catch (error) {
//         console.error('Error checking lead view status:', error);
//       }
//     };

//     // Trigger notification if not viewed within 2 minutes
//     setTimeout(checkViewDtAndNotify, 2 * 60 * 1000);

//     // Notify the assigned user via WebSocket
//     wss.clients.forEach((client) => {
//       if (client.readyState === WebSocket.OPEN) {
//         client.send(
//           JSON.stringify({
//             event: 'lead_reassigned',
//             data: {
//               leadIds: ids,
//               message: 'Lead reassigned successfully!',
//             },
//           })
//         );
//       }
//     });

//     res.status(200).json({
//       success: true,
//       message: 'Lead reassigned successfully.',
//     });
//   } catch (error) {
//     console.error('Error assigning leads:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error assigning leads',
//       error: error.message,
//     });
//   }
// };

// module.exports = { ReassinedLead };




// const mysqlConnection = require('../../utils/database');
// const WebSocket = require('ws'); // For real-time notifications

// const ReassinedLead = async (req, res) => {
//   try {
//     const { ids, assigned_to, view_dt, assigned_on, assigned_through } = req.body;

//     console.log("when reassigning to someone:", req.body);
//     if (!ids || !Array.isArray(ids) || ids.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid or empty IDs array',
//       });
//     }

//     // Fetch the user who is assigning the lead
//     const [assigningUser] = await mysqlConnection.promise().query("SELECT name, assigned_team FROM users WHERE email=?", [assigned_through]);
//     if (!assigningUser || assigningUser.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid assigning user',
//       });
//     }

//     // Fetch the user to whom the lead is being assigned
//     const [assignedUser] = await mysqlConnection.promise().query("SELECT name, assigned_team FROM users WHERE id=?", [assigned_to]);
//     if (!assignedUser || assignedUser.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid assigned user',
//       });
//     }

//     console.log("the user name is:", assignedUser);

//     let sql = 'UPDATE leads_main SET ';
//     const values = [];

//     if (assigned_to !== undefined && assigned_to !== '') {
//       sql += 'assigned_to = ?, ';
//       values.push(assignedUser[0].name);
//     }
//     if (view_dt !== undefined && view_dt !== '') {
//       sql += 'view_dt = ?, ';
//       values.push(view_dt);
//     }
//     if (assigned_on !== undefined && assigned_on !== '') {
//       sql += 'assigned_on = ?, ';
//       values.push(assigned_on);
//     }
//     if (assigningUser[0].name !== undefined && assigningUser[0].name !== '') {
//       sql += 'assigned_through = ?, ';
//       values.push(assigningUser[0].name);
//     }
//     sql += 'status = ?, ';
//     values.push("open");
//     // Update leads_label only if it is currently 12
//     sql += 'leads_label = IF(leads_label = 12, 7, leads_label), ';

//     if (values.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'No fields provided for update',
//       });
//     }

//     sql = sql.slice(0, -2) + ' WHERE id IN (?)'; // Update WHERE clause to handle multiple IDs
//     values.push(ids); // Add the IDs array as a parameter

//     const [result] = await mysqlConnection.promise().query(sql, values);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'No lead customers selected to update',
//       });
//     }

//     // Function to reassign lead repeatedly
//     const reassignLead = async () => {
//       try {
//         // Fetch the lead details
//         const [leadDetails] = await mysqlConnection.promise().query("SELECT view_dt, assigned_to FROM leads_main WHERE id IN (?)", [ids]);

//         if (leadDetails.length > 0) {
//           const { view_dt: leadViewDt, assigned_to: leadAssignedTeam } = leadDetails[0];

//           // Check if view_dt is still "new_lead"
//           if (leadViewDt === "new_lead") {
//             let newAssignedUser = null;

//             // Check if assigned_team is 'm'
//             if (leadAssignedTeam === 'm') {
//               // Fetch manager_id from user_team table
//               const [managerDetails] = await mysqlConnection.promise().query("SELECT manager_id FROM user_team WHERE id=?", [leadAssignedTeam]);
//               if (managerDetails.length > 0) {
//                 const { manager_id: managerId } = managerDetails[0];

//                 // Fetch user with the same assigned_team
//                 const [userDetails] = await mysqlConnection.promise().query("SELECT name FROM users WHERE assigned_team=?", [managerId]);
//                 if (userDetails.length > 0) {
//                   newAssignedUser = userDetails[0].name;
//                 }
//               }
//             } else {
//               // Fetch user with the same assigned_team
//               const [userDetails] = await mysqlConnection.promise().query("SELECT name FROM users WHERE assigned_team=?", [leadAssignedTeam]);
//               if (userDetails.length > 0) {
//                 newAssignedUser = userDetails[0].name;
//               }
//             }

//             // If no user found, assign to a random user
//             if (!newAssignedUser) {
//               const [randomUser] = await mysqlConnection.promise().query("SELECT name FROM users ORDER BY RAND() LIMIT 1");
//               if (randomUser.length > 0) {
//                 newAssignedUser = randomUser[0].name;
//               }
//             }

//             // Update the lead with the new assigned user
//             if (newAssignedUser) {
//               await mysqlConnection.promise().query("UPDATE leads_main SET assigned_to=? WHERE id IN (?)", [newAssignedUser, ids]);

//               // Send WebSocket notification
//               const wss = new WebSocket.Server({ port: 4001 });
//               wss.on('connection', (ws) => {
//                 ws.send(JSON.stringify({
//                   event: 'lead_reassigned',
//                   data: {
//                     leadIds: ids,
//                     newAssignedUser: newAssignedUser,
//                   },
//                 }));
//                 ws.close(); // Close the connection after sending the message
//               });

//               console.log(`Lead reassigned to ${newAssignedUser}.`);
//             }

//             // Schedule the next reassignment check after 2 minutes
//             setTimeout(reassignLead, 2 * 60 * 1000);
//           } else {
//             console.log("Lead view_dt is no longer 'new_lead'. Reassignment stopped.");
//           }
//         }
//       } catch (error) {
//         console.error('Error during reassignment:', error);
//       }
//     };

   
//     setTimeout(reassignLead, 2 * 60 * 1000); 

//     res.status(200).json({
//       success: true,
//       message: 'New lead customers assigned successfully. Reassignment process started.',
//     });
//   } catch (error) {
//     console.error('Error assigning leads to new customers:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error in assigning leads to new customers',
//       error: error.message,
//     });
//   }
// };

// module.exports = { ReassinedLead };




const mysqlConnection = require('../../utils/database');
const {notifyUser}=require('./NewLead')
const axios = require('axios');
// const {sendMessage}=require('../Dashboard/Notification')

const ReassinedLead = async (req, res) => {
    try {
        const { ids, assigned_to, view_dt, assigned_on, assigned_through } = req.body;

        console.log("when reassigning to someone:", req.body);
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or empty IDs array',
            });
        }

        const [leads] = await mysqlConnection.promise().query("SELECT name, assigned_team FROM users WHERE email=?", [assigned_through]);
        const [asigned] = await mysqlConnection.promise().query("SELECT name FROM users WHERE id=?", [assigned_to]);
        console.log("the user name is:", asigned);

        let sql = 'UPDATE leads_main SET ';
        const values = [];

        if (assigned_to !== undefined && assigned_to !== '') {
            sql += 'assigned_to = ?, ';
            values.push(asigned[0].name);
        }
        if (view_dt !== undefined && view_dt !== '') {
            sql += 'view_dt = ?, ';
            values.push(view_dt);
        }
        if (assigned_on !== undefined && assigned_on !== '') {
            sql += 'assigned_on = ?, ';
            values.push(assigned_on);
        }
        if (leads[0].name !== undefined && leads[0].name !== '') {
            sql += 'assigned_through = ?, ';
            values.push(leads[0].name);
        }
        sql += 'status = ?, ';
        values.push("open");
        sql += 'leads_label = IF(leads_label = 12, 7, leads_label), ';

        if (values.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields provided for update',
            });
        }

        sql = sql.slice(0, -2) + ' WHERE id IN (?)';
        values.push(ids);

        const [result] = await mysqlConnection.promise().query(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'No lead customers selected to update',
            });
        }

        // Notify the user about the reassignment
        ids.forEach(async (leadId) => {
            // Call notifyUser for WebSocket notification
            notifyUser(assigned_to, 'Lead reassigned', leadId);

            // Call AutoNewNotification for database notification
            await AutoNewNotification(asigned[0].name, leadId, leads[0].name);
        });
        res.status(200).json({
            success: true,
            message: 'New lead customers assigned successfully',
        });
    } catch (error) {
        console.error('Error assigning leads to new customers:', error);
        res.status(500).json({
            success: false,
            message: 'Error in assigning leads to new customers',
            error: error.message,
        });
    }
};
  
module.exports = { ReassinedLead };


const AutoNewNotification = async (assigned_to, leadId, user) => {
    console.log("the new notification site:", assigned_to, leadId, user);
    try {
        const assignedThroughName = user;

        // Query to get the name of the user assigned to
        const [ass_to] = await mysqlConnection.promise().query("SELECT mobile, sms FROM users WHERE name=?", [assigned_to]);
        if (ass_to.length === 0) {
            throw new Error('Assigned to user not found');
        }

        const assignedToName = assigned_to;
        const assignedToPhone = ass_to[0].mobile; // Assuming the phone number field is 'mobile'
        const sms = ass_to[0].sms;

        // Check if the lead already exists in the notification table
        const [existingNotification] = await mysqlConnection.promise().query(
            "SELECT * FROM leads_notification WHERE leadId = ? AND assigned_to = ?",
            [leadId, assignedToName]
        );

        if (existingNotification.length > 0) {
            // Update the existing notification
            await mysqlConnection.promise().query(
                "UPDATE leads_notification SET assigned_through = ?, user = ? WHERE leadId = ? AND assigned_to = ?",
                [assignedThroughName, assignedThroughName, leadId, assignedToName]
            );
        } else {
            // Insert a new notification
            const sql = 'INSERT INTO leads_notification (leadId, assigned_to, assigned_through, user) VALUES (?, ?, ?, ?)';
            const values = [leadId, assignedToName, assignedThroughName, assignedThroughName];
            await mysqlConnection.promise().query(sql, values);
        }

        // Notify the user about the new assignment
        // notifyUser(assigned_to, 'New lead assigned', leadId); // Call notifyUser

        // Send SMS to the assigned user
        const messageText = `You have been assigned new leads. Please check your notifications.`;
        // const response = await sendMessage(['923032144362'], messageText);
        // sendMessage(['923105223105'], 'You have been assigned new leads. Please check your notifications.')
//   .then(response => console.log('SMS Sent:', response))
//   .catch(error => console.error('Failed to send SMS:', error));
        return { success: true, message: 'Notification created successfully' };
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};




const sendMessage = async (to, text, unicode = false) => {
    try {
      // Validate the 'to' parameter
      if (!to || !Array.isArray(to) || to.length === 0) {
        throw new Error('Invalid or empty "to" parameter');
      }
  
      // Ensure all numbers are in the correct format
      to = to.map(number => {
        if (!number.startsWith('92') || number.length !== 12 || isNaN(number)) {
          throw new Error(`Invalid phone number: ${number}`);
        }
        return number;
      });
  
      // Fetch SMS credentials from the database
      const [result] = await mysqlConnection.promise().query("SELECT msisdn, password, mask FROM leads_sms_credentials");
      if (result.length === 0) {
        throw new Error('SMS credentials not found in the database');
      }
  
      const { msisdn, password, mask } = result[0];
      console.log('SMS Credentials:', { msisdn, password, mask }); // Debug log
  
      // Authenticate with the SMS API
      const authResponse = await axios.get('https://telenorcsms.com.pk:27677/corporate_sms2/api/auth.jsp', {
        params: {
          msisdn: msisdn,
          password: password
        }
      });
  
      console.log('Auth Response:', authResponse.data); // Debug log
  
      // Extract sessionId from the authentication response
      const sessionIdMatch = authResponse.data.match(/<data>(.*)<\/data>/);
      if (!sessionIdMatch) {
        throw new Error('Failed to extract sessionId from auth response');
      }
      const sessionId = sessionIdMatch[1];
      console.log('Session ID:', sessionId); // Debug log
  
      // Send SMS
      const sendResponse = await axios.get('https://telenorcsms.com.pk:27677/corporate_sms2/api/sendsms.jsp', {
        params: {
          session_id: sessionId,
          to: to.join(','),
          text,
          mask,
          unicode: unicode ? 'true' : 'false'
        }
      });
  
      console.log('Send SMS Response:', sendResponse.data); // Debug log
  
      return sendResponse.data;
    } catch (error) {
      console.error('Error sending message:', error.response ? error.response.data : error.message);
      throw error;
    }
  };