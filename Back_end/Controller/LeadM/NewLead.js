const mysqlConnection = require('../../utils/database');
const WebSocket = require('ws');
const { io } = require('../../server');
// const {wss}=require('../../wss-server'); 

const { sendNotificationToUser } =require( '../Dashboard/Notification');
const https = require('https');
// const fs = require('fs');
// const https = require('https');
// const WebSocket = require('ws');

// const server = https.createServer({
//     cert: fs.readFileSync('/etc/letsencrypt/live/api.prosale.cloud/fullchain.pem'),
//     key: fs.readFileSync('/etc/letsencrypt/live/api.prosale.cloud/privkey.pem')
// });
const wss = new WebSocket.Server({ port: 4001 });


const GetSourceDepInterestLeadtype = async (req, res) => {
    try {
        const { company_id } = req.query;
        
        const [sources] = await mysqlConnection.promise().query('SELECT id, platform FROM leads_source');
        const [units] = await mysqlConnection.promise().query('SELECT id, unit FROM inventory_type');
        const [projects] = await mysqlConnection.promise().query(
            'SELECT id, name FROM lead_projects WHERE status = "N"'
        );
        
        const data = sources.map(row => ({ name: row.platform, value: String(row.id) }));
        const data1 = units.map(row => ({ name: row.unit, value: String(row.id) }));
        const data2 = projects.map(row => ({ name: row.name, value: String(row.id) }));

        res.status(200).json({
            success: true,
            message: 'Data fetched successfully',
            data,
            data1,
            data2,
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ success: false, message: 'Error in fetching data', error: error.message });
    }
};

//ok part

// const ReassignedLead = async (leadId, project, user) => {
//     try {
//         const [teamRows] = await mysqlConnection.promise().query(
//             'SELECT id AS team_id, manager_id FROM users_teams WHERE FIND_IN_SET(?, project_id) > 0',
//             [project]
//         );

//         if (teamRows.length === 0) {
//             throw new Error('No team found for the project');
//         }

//         const { team_id, manager_id } = teamRows[0];

//         const [teamMembers] = await mysqlConnection.promise().query(
//             'SELECT id, name FROM users WHERE del="N" AND lead_status="Y" AND assigned_team = ?',
//             [team_id]
//         );

//         let assignedUsers = [...teamMembers];
//         let index = 0;

//          // Check if the lead has been assigned before
       

//         const assignLead = async () => {
//             const [existingNotification] = await mysqlConnection.promise().query(
//                 'SELECT * FROM leads_notification WHERE leadId = ?',
//                 [leadId]
//             );
//             if (index < assignedUsers.length) {
//                 const nextAssignee = assignedUsers[index];
//                 index++;

//                 await mysqlConnection.promise().query(
//                     'UPDATE leads_main SET assigned_to = ?, assigned_on = NOW(), status = "open", leads_label = IF(leads_label = 12, 7, leads_label) WHERE id = ?',
//                     [nextAssignee.name, leadId]
//                 );

//                 console.log(`Lead ${leadId} assigned to ${nextAssignee.name}`);
//                 if (existingNotification.length === 0) {
//                     // If no notification exists, create a new one
//                     // AutoNewNotification(nextAssignee.name, leadId, user)
//                     await AutoNewNotification(nextAssignee.name, leadId, user);
//                 } else {
//                     // If notification exists, update it
//                     // await AutoUpdateNotification(nextAssignee.name, leadId, user);
//                     await AutoUpdateNotification(nextAssignee.name, leadId, user);
//                 }
//                 notifyUser(nextAssignee.id, `Lead assigned to ${nextAssignee.name}`,leadId);
                

//                 setTimeout(async () => {
//                     const [leadDetails] = await mysqlConnection.promise().query(
//                         'SELECT view_dt FROM leads_main WHERE id = ?',
//                         [leadId]
//                     );

//                     if (leadDetails.length > 0 && leadDetails[0].view_dt === "new_lead") {
//                         console.log(`Lead ${leadId} not viewed by ${nextAssignee.name}. Reassigning...`);
//                         notifyUser(nextAssignee.id, null,leadId);
//                         assignLead();
//                     }
//                 }, 2 * 60 * 1000);
//             } else {
//                 // Assign back to manager if no one views it
//                 const [manager] = await mysqlConnection.promise().query(
//                     'SELECT id, name FROM users WHERE id = ?',
//                     [manager_id]
//                 );
//                 if (manager.length > 0) {
//                     await mysqlConnection.promise().query(
//                         'UPDATE leads_main SET assigned_to = ?, assigned_on = NOW() WHERE id = ?',
//                         [manager[0].name, leadId]
//                     );
//                     console.log(`Lead ${leadId} reassigned to Manager ${manager[0].name}`);
//                     notifyUser(manager[0].id, `Lead reassigned to ${manager[0].name}`,leadId);
//                 } else {
//                     console.log('No manager found for reassignment');
//                 }
//             }
//         };

//         assignLead();
//     } catch (error) {
//         console.error('Error in ReassignedLead:', error);
//     }
// };


//updated correct code before the lead_pass columns
// const ReassignedLead = async (leadId, project, user) => {
//     try {
//         const [teamRows] = await mysqlConnection.promise().query(
//             'SELECT id AS team_id, manager_id FROM users_teams WHERE FIND_IN_SET(?, project_id) > 0',
//             [project]
//         );

//         if (teamRows.length === 0) {
//             throw new Error('No team found for the project');
//         }

//         const { team_id, manager_id } = teamRows[0];

//         const [teamMembers] = await mysqlConnection.promise().query(
//             'SELECT id, name FROM users WHERE del="N" AND lead_status="Y" AND assigned_team = ?',
//             [team_id]
//         );

//         let assignedUsers = [...teamMembers];
//         let index = 0;

//         const assignLead = async () => {
//             const [existingNotification] = await mysqlConnection.promise().query(
//                 'SELECT * FROM leads_notification WHERE leadId = ?',
//                 [leadId]
//             );
            
//             if (index < assignedUsers.length) {
//                 const nextAssignee = assignedUsers[index];
//                 index++;

//                 await mysqlConnection.promise().query(
//                     'UPDATE leads_main SET assigned_to = ?, assigned_on = NOW(), status = "open", leads_label = IF(leads_label = 12, 7, leads_label) WHERE id = ?',
//                     [nextAssignee.name, leadId]
//                 );

//                 console.log(`Lead ${leadId} assigned to ${nextAssignee.name}`);
//                 await mysqlConnection.promise().query(
//                     'UPDATE leads_main SET lead_pass = ? WHERE id = ?',
//                     [nextAssignee.name, leadId]
//                 );
                
//                 // Always check for existing notification and call appropriate function
//                 if (existingNotification.length === 0) {
//                     console.log('Creating new notification');
//                     await AutoNewNotification(nextAssignee.name, leadId, user);
//                 } else {
//                     console.log('Updating existing notification');
//                     await AutoUpdateNotification(nextAssignee.name, leadId, user);
//                 }
                
//                 notifyUser(nextAssignee.id, `Lead assigned to ${nextAssignee.name}`, leadId);

//                 setTimeout(async () => {
//                     const [leadDetails] = await mysqlConnection.promise().query(
//                         'SELECT view_dt FROM leads_main WHERE id = ?',
//                         [leadId]
//                     );

//                     if (leadDetails.length > 0 && leadDetails[0].view_dt === "new_lead") {
//                         console.log(`Lead ${leadId} not viewed by ${nextAssignee.name}. Reassigning...`);
//                         notifyUser(nextAssignee.id, null, leadId);
//                         assignLead();
//                     }
//                 }, 2 * 60 * 1000);
//             } else {
//                 // Assign back to manager if no one views it
//                 const [manager] = await mysqlConnection.promise().query(
//                     'SELECT id, name FROM users WHERE id = ?',
//                     [manager_id]
//                 );
                
//                 if (manager.length > 0) {
//                     await mysqlConnection.promise().query(
//                         'UPDATE leads_main SET assigned_to = ?, assigned_on = NOW() WHERE id = ?',
//                         [manager[0].name, leadId]
//                     );
//                     console.log(`Lead ${leadId} reassigned to Manager ${manager[0].name}`);
                    
//                     // Check if notification exists before updating
//                     const [existingNotification] = await mysqlConnection.promise().query(
//                         'SELECT * FROM leads_notification WHERE leadId = ?',
//                         [leadId]
//                     );
                    
//                     if (existingNotification.length > 0) {
//                         console.log('Updating notification for manager reassignment');
//                         await AutoUpdateNotification(manager[0].name, leadId, user);
//                     } else {
//                         console.log('Creating new notification for manager');
//                         await AutoNewNotification(manager[0].name, leadId, user);
//                     }
                    
//                     notifyUser(manager[0].id, `Lead reassigned to ${manager[0].name}`, leadId);
//                 } else {
//                     console.log('No manager found for reassignment');
//                 }
//             }
//         };

//         assignLead();
//     } catch (error) {
//         console.error('Error in ReassignedLead:', error);
//     }
// };


const ReassignedLead = async (leadId, project, user) => {
    try {
        // Get all teams and their managers for this project
        const [teamRows] = await mysqlConnection.promise().query(
            'SELECT id AS team_id, manager_id FROM users_teams WHERE FIND_IN_SET(?, project_id) > 0',
            [project]
        );
        if (teamRows.length === 0) throw new Error('No team found for the project');

        // Gather all managers for all teams (avoid duplicates)
        const managerIds = [...new Set(teamRows.map(team => team.manager_id))];
        const managers = [];
        for (const manager_id of managerIds) {
            const [managerRows] = await mysqlConnection.promise().query(
                'SELECT id AS manager_id, name FROM users WHERE id = ?',
                [manager_id]
            );
            if (managerRows.length > 0) {
                managers.push(managerRows[0]);
            }
        }
        if (managers.length === 0) throw new Error('No managers found for the project');

        // Get the next manager in round-robin for this project
        const nextManager = await getNextManagerForProject(project, managers);

        // Assign the lead to the selected manager
        await mysqlConnection.promise().query(
            'UPDATE leads_main SET assigned_to = ?, assigned_on = NOW(), status = "open", leads_label = IF(leads_label = 12, 7, leads_label) WHERE id = ?',
            [nextManager.name, leadId]
        );

        // Update lead_pass
        const [leadPassResult] = await mysqlConnection.promise().query(
            'SELECT lead_pass FROM leads_main WHERE id = ?',
            [leadId]
        );
        const currentLeadPass = leadPassResult[0]?.lead_pass || '';
        const newLeadPass = currentLeadPass ? `${currentLeadPass},${nextManager.name}` : nextManager.name;
        await mysqlConnection.promise().query(
            'UPDATE leads_main SET lead_pass = ? WHERE id = ?',
            [newLeadPass, leadId]
        );

        // Notification logic
        const [existingNotification] = await mysqlConnection.promise().query(
            'SELECT * FROM leads_notification WHERE leadId = ?',
            [leadId]
        );
        if (existingNotification.length === 0) {
            await AutoNewNotification(nextManager.name, leadId, user);
        } else {
            await AutoUpdateNotification(nextManager.name, leadId, user);
        }
        notifyUser(nextManager.manager_id, `Lead assigned to ${nextManager.name}`, leadId);

    } catch (error) {
        console.error('Error in ReassignedLead:', error);
    }
};

const notifyUser = async (userId, message, leadId) => {
    const [leadDetails] = await mysqlConnection.promise().query(
        'SELECT last_updated FROM leads_main WHERE id = ?',
        [leadId]
    );

    const lastUpdated = leadDetails[0]?.last_updated || new Date().toISOString();
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ event: message ? 'lead_assigned' : 'lead_reassigned', data: { userId, message, leadId, created_at: lastUpdated } }));
        }
    });
};







// leads was assinged to manager
// const CreateNewLead = async (req, res) => {
//   const { csv } = req.query;
//   const {user}=req.body;

//   if (csv) {
//     const leads = req.body;
//     if (!Array.isArray(leads) || leads.length === 0) {
//       return res.status(400).json({ success: false, message: 'No leads data found in request.' });
//     }

//     const dt = new Date();
//     const results = [];

//     // Map sources
//     const [allSources] = await mysqlConnection.promise().query(
//       'SELECT id, platform FROM leads_source'
//     );
//     const sourceMap = Object.fromEntries(
//       allSources.map((src) => [src.platform.trim().toLowerCase(), src.id])
//     );

//     // Map projects
//     const [allProjects] = await mysqlConnection.promise().query(
//       'SELECT id, name FROM lead_projects'
//     );
//     const projectMap = Object.fromEntries(
//       allProjects.map((p) => [p.name.trim().toLowerCase(), p.id])
//     );

//     for (const lead of leads) {
    
//       try {
//         const {
//           full_name = '',
//           mobile = '',
//           email = '',
//           investment_budget = '',
//           type = '',
//           source = '',
//           interested_in = '',
//           project = '',
//           company_id = '',
//           user = '',
//         } = lead;
//         const normalizedMobile = normalizeMobile(mobile);

//         if (!normalizedMobile) {
//           results.push({ success: false, mobile, message: 'Mobile Number is required' });
//           continue;
//         }

//         const sourceId = sourceMap[source.trim().toLowerCase()];
//         console.log("the lead sorce is:",sourceId)
//         if (!sourceId) {
//           results.push({ success: false, mobile, message: `Invalid source: '${source}'` });
//           continue;
//         }

//         const projectId = projectMap[project.trim().toLowerCase()];
//         if (!projectId) {
//           results.push({ success: false, mobile, message: `Invalid project: '${project}'` });
//           continue;
//         }

//         // Check if customer exists
//         const [customerCheck] = await mysqlConnection.promise().query(
//           `SELECT id FROM leads_customers WHERE mobile = ?`,
//           [normalizedMobile]
//         );

//         let customerId = customerCheck.length > 0 ? customerCheck[0].id : null;

//         // Create customer if not exists
//         if (!customerId) {
//           const [insertCustomer] = await mysqlConnection.promise().query(
//             `INSERT INTO leads_customers (full_name, mobile, email, company_id, dt, type) 
//              VALUES (?, ?, ?, ?, ?, ?)`,
//             [full_name, mobile, email, company_id, dt, type]
//           );
//           customerId = insertCustomer.insertId;
//         }

//         // Check if the same project lead already exists
//         const [projectLeadCheck] = await mysqlConnection.promise().query(
//           `SELECT id, assigned_to FROM leads_main 
//            WHERE customer = ? AND project = ?`,
//           [customerId, projectId]
//         );
//         console.log(" project leads check:",projectLeadCheck)

//         if (projectLeadCheck.length > 0) {
//           results.push({
//             success: false,
//             mobile,
//             message: `Same Project Lead already assigned to ${projectLeadCheck[0].assigned_to || 'unknown user'}`,
//           });
//           continue;
//         }

//         // Insert the new lead
//         const [insertLeadResult] = await mysqlConnection.promise().query(
//           `INSERT INTO leads_main 
//            (customer, leads_source, project, assigned_to, interested_in, investment_budget, dt, company_id, user, assigned_on) 
//            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//           [
//             customerId,
//             sourceId,
//             projectId,
//             user,
//             interested_in,
//             investment_budget,
//             dt,
//             company_id,
//             user,
//             dt,
//           ]
//         );

//         await sendNotificationToUser(user, {
//           id: insertLeadResult.insertId,
//           name: full_name || `Lead #${insertLeadResult.insertId}`,
//         });
 
//         ReassignedLead(insertLeadResult.insertId, projectId, user);
//         console.log("the lead notification send to:",insertLeadResult)
//         results.push({ success: true, mobile, message: 'Lead created successfully' });
//       } catch (err) {
//         console.error(`❌ Error processing lead with mobile ${lead.mobile}:`, err.stack);
//         results.push({
//           success: false,
//           mobile: lead.mobile || 'N/A',
//           message: `Internal error: ${err.message}`,
//         });
//       }
//     }

//     return res.status(200).json({ success: true, results });
//   }

//   // Single lead logic (unchanged)
//   try {
//     const {
//       full_name,
//       mobile,
//       email,
//       investment_budget,
//       type,
//       source,
//       interested_in,
//       company_id,
//       project,
//       remarks,
//       dt,
//       user,
//     } = req.body;

//     if (!mobile) {
//       return res.status(400).json({ success: false, message: 'Mobile Number is required' });
//     }

//     // Check if customer exists
//     const [customerCheck] = await mysqlConnection.promise().query(
//       `SELECT id FROM leads_customers WHERE mobile = ?`,
//       [mobile]
//     );

//     let customerId = customerCheck.length > 0 ? customerCheck[0].id : null;

//     if (!customerId) {
//       const [insertCustomer] = await mysqlConnection.promise().query(
//         `INSERT INTO leads_customers (full_name, mobile, email, company_id, dt, type) 
//          VALUES (?, ?, ?, ?, ?, ?)`,
//         [full_name, mobile, email, company_id, dt, type]
//       );
//       customerId = insertCustomer.insertId;
//     }

//     // Check if same project lead exists
//     const [projectLeadCheck] = await mysqlConnection.promise().query(
//       `SELECT id, assigned_to FROM leads_main 
//        WHERE customer = ? AND project = ?`,
//       [customerId, project]
//     );

//     if (projectLeadCheck.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: `Same Project Lead already assigned to ${projectLeadCheck[0].assigned_to}`,
//       });
//     }

//     const [insertLeadResult] = await mysqlConnection.promise().query(
//       `INSERT INTO leads_main 
//        (customer, leads_source, project, assigned_to, interested_in, investment_budget, dt, company_id, user, assigned_on) 
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         customerId,
//         source,
//         project,
//         user,
//         interested_in,
//         investment_budget,
//         dt,
//         company_id,
//         user,
//         dt,
//       ]
//     );

//     await sendNotificationToUser(user, {
//       id: insertLeadResult.insertId,
//       name: full_name || `Lead #${insertLeadResult.insertId}`,
//     });

//     ReassignedLead(insertLeadResult.insertId, project, user);

//     res.status(200).json({
//       success: true,
//       message: 'Lead created successfully',
//       leadId: insertLeadResult.insertId,
//       customerId,
//     });
//   } catch (error) {
//     console.error('❌ Error creating lead:', error.stack);
//     res.status(500).json({
//       success: false,
//       message: 'Error in creating lead',
//       error: error.message,
//     });
//   }
// };

const CreateNewLead = async (req, res) => {
  const { csv,user } = req.query;

  // the user we want to assign leads to (required)
  const assignedTo = user;
  if (!assignedTo) {
    return res.status(400).json({ success: false, message: "Assigned user (user) is required." });
  }

  if (csv) {
    // expecting an array of lead rows in the body
    const leads = req.body;
    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ success: false, message: "No leads data found in request." });
    }

    const dt = new Date();
    const results = [];

    // Map sources
    const [allSources] = await mysqlConnection.promise().query(
      "SELECT id, platform FROM leads_source"
    );
    const sourceMap = Object.fromEntries(
      allSources.map((src) => [src.platform.trim().toLowerCase(), src.id])
    );

    // Map projects
    const [allProjects] = await mysqlConnection.promise().query(
      "SELECT id, name FROM lead_projects"
    );
    const projectMap = Object.fromEntries(
      allProjects.map((p) => [p.name.trim().toLowerCase(), p.id])
    );

    for (const lead of leads) {
      try {
        // IMPORTANT: do NOT shadow the request-level 'assignedTo'
        const {
          full_name = "",
          mobile = "",
          email = "",
          investment_budget = "",
          type = "",
          source = "",
          interested_in = "",
          project = "",
          company_id = "",
          city="",
          // ignore any 'user' field on each CSV row; we always use assignedTo from req.body
        } = lead;

        const normalizedMobile = normalizeMobile(mobile);
        if (!normalizedMobile) {
          results.push({ success: false, mobile, message: "Mobile Number is required" });
          continue;
        }

        const sourceId = sourceMap[source.trim().toLowerCase()];
        if (!sourceId) {
          results.push({ success: false, mobile, message: `Invalid source: '${source}'` });
          continue;
        }

        const projectId = projectMap[project.trim().toLowerCase()];
        if (!projectId) {
          results.push({ success: false, mobile, message: `Invalid project: '${project}'` });
          continue;
        }

        // Check if customer exists
        const [customerCheck] = await mysqlConnection.promise().query(
          `SELECT id FROM leads_customers WHERE mobile = ?`,
          [normalizedMobile]
        );
        let customerId = customerCheck.length > 0 ? customerCheck[0].id : null;

        // Create customer if not exists
        if (!customerId) {
          const [insertCustomer] = await mysqlConnection.promise().query(
            `INSERT INTO leads_customers (full_name, mobile, email, company_id, dt, type, city) 
             VALUES (?, ?, ?, ?, ?, ?,?)`,
            [full_name, mobile, email, company_id, dt, type,city]
          );
          customerId = insertCustomer.insertId;
        }

        // Check if the same project lead already exists
        const [projectLeadCheck] = await mysqlConnection.promise().query(
          `SELECT id, assigned_to FROM leads_main 
           WHERE customer = ? AND project = ?`,
          [customerId, projectId]
        );

        if (projectLeadCheck.length > 0) {
          results.push({
            success: false,
            mobile,
            message: `Same Project Lead already assigned to ${projectLeadCheck[0].assigned_to || "unknown user"}`,
          });
          continue;
        }

        // Insert the new lead - ALWAYS assign to assignedTo from request body
        const [insertLeadResult] = await mysqlConnection.promise().query(
          `INSERT INTO leads_main 
           (customer, leads_source, project, assigned_to, interested_in, investment_budget, dt, company_id, user, assigned_on) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            customerId,
            sourceId,
            projectId,
            assignedTo,               // <--- assign here
            interested_in,
            investment_budget,
            dt,
            company_id,
            assignedTo,               // keep 'user' column same as assigned user
            dt,
          ]
        );

        await sendNotificationToUser(assignedTo, {
          id: insertLeadResult.insertId,
          name: full_name || `Lead #${insertLeadResult.insertId}`,
        });

        // Disable manager-based reassignment
        // ReassignedLead(insertLeadResult.insertId, projectId, assignedTo);

        results.push({ success: true, mobile, message: "Lead created successfully" });
      } catch (err) {
        console.error(`❌ Error processing lead with mobile ${lead.mobile}:`, err.stack);
        results.push({
          success: false,
          mobile: lead.mobile || "N/A",
          message: `Internal error: ${err.message}`,
        });
      }
    }

    return res.status(200).json({ success: true, results });
  }

  // Single lead logic
  try {
    const {
      full_name,
      mobile,
      email,
      investment_budget,
      type,
      source,          // for single lead you seem to pass an ID already; leaving as-is
      interested_in,
      company_id,
      project,         // project id
      remarks,         // (unused here but kept if needed elsewhere)
      dt,
      city,
      // user          // ignore any user here; we already have assignedTo
    } = req.body;

    if (!mobile) {
      return res.status(400).json({ success: false, message: "Mobile Number is required" });
    }

    // Check if customer exists
    const [customerCheck] = await mysqlConnection.promise().query(
      `SELECT id FROM leads_customers WHERE mobile = ?`,
      [mobile]
    );
    let customerId = customerCheck.length > 0 ? customerCheck[0].id : null;

    if (!customerId) {
      const [insertCustomer] = await mysqlConnection.promise().query(
        `INSERT INTO leads_customers (full_name, mobile, email, company_id, dt, type,city) 
         VALUES (?, ?, ?, ?, ?, ?,?)`,
        [full_name, mobile, email, company_id, dt, type,city]
      );
      customerId = insertCustomer.insertId;
    }

    // Check if same project lead exists
    const [projectLeadCheck] = await mysqlConnection.promise().query(
      `SELECT id, assigned_to FROM leads_main 
       WHERE customer = ? AND project = ?`,
      [customerId, project]
    );

    if (projectLeadCheck.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Same Project Lead already assigned to ${projectLeadCheck[0].assigned_to}`,
      });
    }

    const [insertLeadResult] = await mysqlConnection.promise().query(
      `INSERT INTO leads_main 
       (customer, leads_source, project, assigned_to, interested_in, investment_budget, dt, company_id, user, assigned_on) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerId,
        source,
        project,
        assignedTo,          // <--- assign to request user
        interested_in,
        investment_budget,
        dt,
        company_id,
        assignedTo,          // keep 'user' column same as assigned user
        dt,
      ]
    );

    await sendNotificationToUser(assignedTo, {
      id: insertLeadResult.insertId,
      name: full_name || `Lead #${insertLeadResult.insertId}`,
    });

    // Disable manager-based reassignment
    // ReassignedLead(insertLeadResult.insertId, project, assignedTo);

    res.status(200).json({
      success: true,
      message: "Lead created successfully",
      leadId: insertLeadResult.insertId,
      customerId,
      assignedTo,
    });
  } catch (error) {
    console.error("❌ Error creating lead:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error in creating lead",
      error: error.message,
    });
  }
};











// const AutoNewNotification = async (assigned_to, leadId, user) => {
//     console.log("the assigned  to leasid and the user is:", assigned_to, leadId, user)
//     try {
//     //   const { ids, assigned_to, view_dt, assigned_on, assigned_through } = req.body;
  
//       const assignedThroughName = user;
    
//       // Query to get the name of the user assigned to
//       const [ass_to] = await mysqlConnection.promise().query("SELECT name, mobile, sms FROM users WHERE id=?", [assigned_to]);
//     //   if (ass_to.length === 0) {
//     //     return res.status(400).json({
//     //       success: false,
//     //       message: 'Assigned to user not found',
//     //     });
//     //   }
  
//       const assignedToName = ass_to[0].name;
//       const assignedToPhone = ass_to[0].mobile; // Assuming the phone number field is 'phone'
//       const sms = ass_to[0].sms;
//      console.log("the ass_to:",ass_to)
//       // Insert a new notification for each id
//     //   for (const id of ids) {
//     //     const sql = 'INSERT INTO leads_notification (leadId, assigned_to, assigned_through, user) VALUES (?, ?, ?, ?)';
//     //     const values = [id, assignedToName, assignedThroughName, assignedThroughName];
//     //     await mysqlConnection.promise().query(sql, values);
  
//     //     // Emit the notification to the assigned user
//     //     io?.to(assigned_to).emit('notification', {
//     //       message: `New Notification created for lead ID: ${id}`,
//     //     });
//     //   }
    
//         const sql = 'INSERT INTO leads_notification (leadId, assigned_to, assigned_through, user) VALUES (?, ?, ?, ?)';
//         const values = [leadId, assignedToName, assignedThroughName, assignedThroughName];
//         await mysqlConnection.promise().query(sql, values);
  
//         // Emit the notification to the assigned user
//         io?.to(assigned_to).emit('notification', {
//           message: `New Notification created for lead ID: ${leadId}`,
//         });

  
//       // Send SMS to the assigned user
//       const messageText = `You have been assigned new leads. Please check your notifications.`;
//       // const mask = 'Elaan Mrktg'; 
//       const formattedPhone = `92${assignedToPhone.slice(1)}`;
//       // await sendMessage([formattedPhone], messageText);
//       if(sms==="Y"){const response=await sendMessage([`923032144362`], messageText);
      
//     }
    
//     //   res.status(200).json({
//     //     success: true,
//     //     message: 'Notifications created successfully and message sent',
//     //   });
//     } catch (error) {
//       console.error('Error creating notification:', error);
//     //   res.status(500).json({
//     //     success: false,
//     //     message: 'Error in creating notification',
//     //     error: error.message,
//     //   });
//     }
//   };
const AutoNewNotification = async (assigned_to, leadId, user) => {
    console.log("the new notification site:", assigned_to, leadId, user);
    try {
        const assignedThroughName = user;
        const [leadDetails] = await mysqlConnection.promise().query(
            'SELECT last_updated FROM leads_main WHERE id = ?',
            [leadId]
        );
        const lastUpdated = leadDetails[0]?.last_updated || new Date();
        // Query to get the name of the user assigned to
        const [ass_to] = await mysqlConnection.promise().query("SELECT mobile, sms FROM users WHERE name=?", [assigned_to]);
        if (ass_to.length === 0) {
            throw new Error('Assigned to user not found');
        }

        const assignedToName = assigned_to;
        const assignedToPhone = ass_to[0].mobile; // Assuming the phone number field is 'mobile'
        const sms = ass_to[0].sms;

        // Insert a new notification
        const sql = 'INSERT INTO leads_notification (leadId, assigned_to, assigned_through, user) VALUES (?, ?, ?, ?)';
        const values = [leadId, assignedToName, assignedThroughName, assignedThroughName];
        await mysqlConnection.promise().query(sql, values);

        // Emit the notification to the assigned user
        io?.to(assigned_to).emit('notification', {
            message: `New Notification created for lead ID: ${leadId}`,
            created_at: lastUpdated,
        });

        // Send SMS to the assigned user
        const messageText = `You have been assigned new leads. Please check your notifications.`;
        // const response = await sendMessage(['923105223105'], messageText);
        // const formattedPhone = `92${assignedToPhone.slice(1)}`;
        // if (sms === "Y") {
        //     const response = await sendMessage([formattedPhone], messageText);
        // }

        return { success: true, message: 'Notification created successfully' };
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

const AutoUpdateNotification = async (assigned_to, leadId, user) => {
    console.log("the value at the auto update section, assinged to, id, and user:", assigned_to, leadId, user);
    try {
        const assignedThroughName = user;

        // Query to get the name of the user assigned to
        const [ass_to] = await mysqlConnection.promise().query("SELECT  mobile, sms FROM users WHERE name=?", [assigned_to]);
        if (ass_to.length === 0) {
            throw new Error('Assigned to user not found');
        }

        const assignedToName = assigned_to;
        const assignedToPhone = ass_to[0].mobile; // Assuming the phone number field is 'mobile'
        const sms = ass_to[0].sms;

        // Update the notification for the lead
        const sql = 'UPDATE leads_notification SET assigned_to = ? WHERE leadId = ?';
        const values = [assignedToName, leadId];
        await mysqlConnection.promise().query(sql, values);

        // Emit the notification to the assigned user
        io?.to(assigned_to).emit('notification', {
            message: `Lead ID: ${leadId} has been reassigned to you.`,
        });

        // Send SMS to the assigned user
        const messageText = `You have been reassigned to lead ID: ${leadId}. Please check your notifications.`;
        // const formattedPhone = `92${assignedToPhone.slice(1)}`; // Format phone number for SMS
        // if (sms === "Y") {
        //     const response = await sendMessage([formattedPhone], messageText);
        //     console.log("SMS sent to:", formattedPhone);
        // }
        // const response = await sendMessage(['923105223105'], messageText);
        
        return { success: true, message: 'Notification updated successfully' };
    } catch (error) {
        console.error('Error updating notification:', error);
        throw error;
    }
};


// facebook leads

const facebookLeads = async (req, res) => {
    try {
      
        const leadData = req.body;
        console.log('Received lead from the facebook leads:', leadData);
    
        // Save the lead to your database or process it further
        // Example: saveLeadToDatabase(leadData);
    
        // Send a response to Zapier
        res.status(200).json({ success: true, message: 'Lead received' });
    
    
    } catch (error) {
        console.error('Error creating lead:', error);
        res.status(500).json({ success: false, message: 'Error in creating lead', error: error.message });
    }
};







module.exports = { GetSourceDepInterestLeadtype, CreateNewLead, ReassignedLead, notifyUser };
// module.exports = { GetSourceDepInterestLeadtype, CreateNewLead, ReassignedLead, notifyUser, facebookLeads };




const axios = require('axios');

const sendMessage = async (to, text, unicode = false) => {
  try {
    const [result] = await mysqlConnection.promise().query("SELECT msisdn, password, mask FROM leads_sms_credentials");
    const msisdn=result[0].msisdn;
    const password=result[0].password;
    const mask=result[0].mask;
    const authResponse = await axios.get('https://telenorcsms.com.pk:27677/corporate_sms2/api/auth.jsp', {
      params: {
        msisdn: msisdn,
        password: password
      }
    });

    const sessionId = authResponse.data.match(/<data>(.*)<\/data>/)[1];

    const sendResponse = await axios.get('https://telenorcsms.com.pk:27677/corporate_sms2/api/sendsms.jsp', {
      params: {
        session_id: sessionId,
        to: to.join(','),
        text,
        mask,
        unicode: unicode ? 'true' : 'false'
      }
    });

    return sendResponse.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};




// Helper to get next manager in round-robin for a project
const getNextManagerForProject = async (projectId, managers) => {
    if (managers.length === 0) return null;
    const [lastAssignRows] = await mysqlConnection.promise().query(
        'SELECT last_manager_id FROM lead_manager_assignment WHERE project_id = ?',
        [projectId]
    );
    let nextManager;
    if (lastAssignRows.length === 0) {
        nextManager = managers[0];
        await mysqlConnection.promise().query(
            'INSERT INTO lead_manager_assignment (project_id, last_manager_id) VALUES (?, ?)',
            [projectId, nextManager.manager_id]
        );
    } else {
        const lastManagerId = lastAssignRows[0].last_manager_id;
        const idx = managers.findIndex(m => m.manager_id === lastManagerId);
        nextManager = managers[(idx + 1) % managers.length];
        await mysqlConnection.promise().query(
            'UPDATE lead_manager_assignment SET last_manager_id = ? WHERE project_id = ?',
            [nextManager.manager_id, projectId]
        );
    }
    return nextManager;
};

// Helper to get next member in round-robin for a project
const getNextMemberForProject = async (projectId, members) => {
    if (members.length === 0) return null;
    const [lastAssignRows] = await mysqlConnection.promise().query(
        'SELECT last_member_id FROM lead_member_assignment WHERE project_id = ?',
        [projectId]
    );
    let nextMember;
    if (lastAssignRows.length === 0) {
        nextMember = members[0];
        await mysqlConnection.promise().query(
            'INSERT INTO lead_member_assignment (project_id, last_member_id) VALUES (?, ?)',
            [projectId, nextMember.id]
        );
    } else {
        const lastMemberId = lastAssignRows[0].last_member_id;
        const idx = members.findIndex(m => m.id === lastMemberId);
        nextMember = members[(idx + 1) % members.length];
        await mysqlConnection.promise().query(
            'UPDATE lead_member_assignment SET last_member_id = ? WHERE project_id = ?',
            [nextMember.id, projectId]
        );
    }
    return nextMember;
};

// Helper to normalize mobile numbers (handles scientific notation)
function normalizeMobile(mobile) {
    if (typeof mobile === 'number') {
        // Convert number to string without scientific notation
        return mobile.toLocaleString('fullwide', {useGrouping:false});
    }
    if (typeof mobile === 'string' && mobile.match(/e\+/i)) {
        // If string is in scientific notation, convert to number then to string
        return Number(mobile).toLocaleString('fullwide', {useGrouping:false});
    }
    return mobile;
}