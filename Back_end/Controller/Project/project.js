const mysqlConnection = require('../../utils/database');

const projectData = async (req, res) => {
    const {email}=req.query;

    try {
        [user]=await mysqlConnection.promise().query('SELECT company_id from users where email=?',[email])
        let projects;
        [projects] = await mysqlConnection.promise().query(`
        SELECT 
            lp.id,
            lp.name,
            lp.status,
            lp.category,
            lp.Csv_Label,
            lp.Whatsapp_Sort,
            lp.Whatsapp_Status,
            lp.Portal_Status,
            lp.Image,
            lp.Location,
            lp.del,
            c.title AS company_title
        FROM 
            lead_projects lp
        LEFT JOIN 
            companies c ON lp.company_id = c.id
        WHERE 
            FIND_IN_SET(lp.company_id, ?) > 0;`, [user[0].company_id]);


        if (!projects.length) {
            return res.status(200).json({
                success: true,
                message: 'No projects found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'All projects information fetched successfully',
            projects: projects,
        });
    } catch (error) {
        console.error('Error fetching project information:', error);
        res.status(500).json({
            success: false,
            message: 'Error in fetching project information',
            error: error.message,
        });
    }
};
//status for the project


const GetStatus = async (req, res) => {
    try {
        // Use a connection pool to handle connections
        const [rows, fields] = await mysqlConnection.promise().query('SELECT status,value FROM project_status');

        // Respond with an array of objects containing name and sign
        const data = rows.map(row => ({
            name: row.status,
            value: row.value
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
//create new Project
const CreateNewProject = async (req, res) => {
    try {
        // Extract fields from the request body
        const { name, Image, Location, Portal_Status, Whatsapp_Sort,
            Whatsapp_Status, date, description, status, del, user, dt,company_id } = req.body;
        const prefixedBase64String = `data:image/jpeg;base64,${req.body.Image}`;
        const Csv_Label = name.replace(/\s/g, '_'); // Replace spaces with underscores

        let sql = '';
        let values = [];

        // Check if Csv_Label already exists
        const checkSql = 'SELECT COUNT(*) AS count FROM lead_projects WHERE Csv_Label = ?';
        const [checkResult] = await mysqlConnection.promise().query(checkSql, [Csv_Label]);
        const existingCount = checkResult[0].count;
        

        if (existingCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Csv_Label already exists. Please choose a different name.',
            });
        } else {
            // Fetch the count of existing rows
            const getCountSql = 'SELECT COUNT(*) AS rowCount FROM lead_projects';
            const [rowCountResult] = await mysqlConnection.promise().query(getCountSql);
            const rowCount = rowCountResult[0].rowCount;

            // Increment rowCount by 1 and use it for Whatsapp_Sort
            const updatedWhatsappSort = rowCount+1;

            sql = `INSERT INTO lead_projects SET `;
            values = [];

            // Add fields to the INSERT query based on the table name
            if (name !== undefined && name !== '') {
                sql += 'name = ?, ';
                values.push(name);
            }
            if (Csv_Label !== undefined && Csv_Label !== '') {
                sql += 'Csv_Label = ?, ';
                values.push(Csv_Label);
            }
            if (Image !== undefined && Image !== '') {
                sql += 'Image = ?, ';
                values.push(prefixedBase64String);
            }
            if (Location !== undefined && Location !== '') {
                sql += 'Location = ?, ';
                values.push(Location);
            }
            if (Portal_Status !== undefined && Portal_Status !== '') {
                sql += 'Portal_Status = ?, ';
                values.push(Portal_Status);
            }
            // Add Whatsapp_Sort with the incremented value
            sql += 'Whatsapp_Sort = ?, ';
            values.push(updatedWhatsappSort);
            if (Whatsapp_Status !== undefined && Whatsapp_Status !== '') {
                sql += 'Whatsapp_Status = ?, ';
                values.push(Whatsapp_Status);
            }
            if (date !== undefined && date !== '') {
                sql += 'date = ?, ';
                values.push(date);
            }
            if (description !== undefined && description !== '') {
                sql += 'description = ?, ';
                const trimmedDescription = description.slice(3, -4);
                values.push(trimmedDescription);
            }
            if (status !== undefined && status !== '') {
                sql += 'status = ?, ';
                values.push(status);
            }
            if (del !== undefined && del !== '') {
                sql += 'del = ?, ';
                values.push(del);
            }
            if (user !== undefined && user !== '') {
                sql += 'user = ?, ';
                values.push(user);
            }
            if (dt !== undefined && dt !== '') { 
                sql += 'dt = ?, ';
                values.push(dt);
            }
            if (company_id !== undefined && company_id !== '') { 
                sql += 'company_id = ?, ';
                values.push(company_id);
            }

            // Remove the trailing comma and space
            sql = sql.slice(0, -2);

            // Execute the query
            const [result] = await mysqlConnection.promise().query(sql, values);

            res.status(200).json({
                success: true,
                message: `New Project Created successfully`,
            });
        }
    } catch (error) {
        console.error('Error Creating project:', error);
        return res.status(500).json({
            success: false,
            message: `Error in creating project`,
            error: error.message,
        });
    }
};

const UpdateProject = async (req, res) => {
    try {
        // Extract fields from the request body
        const {id}=req.params
        const { name, Image, Location, Portal_Status, Whatsapp_Sort,
            Whatsapp_Status, date, description, status, del, user, dt } = req.body;
        const prefixedBase64String = `data:image/jpeg;base64,${req.body.Image}`;
        const Csv_Label = name?.replace(/\s/g, '_');
        let sql = '';
        let values = [];

     

       

        sql = `UPDATE lead_projects SET `;
        values = [];

        // Add fields to the UPDATE query based on the provided fields in the request body
        if (name !== undefined && name !== '') {
            sql += 'name = ?, ';
            values.push(name);
        }
        if (Image !== undefined && Image !== '') {
            sql += 'Image = ?, ';
            values.push(prefixedBase64String);
        }
        if (Csv_Label !== undefined && Csv_Label !== '') {
            sql += 'Csv_Label = ?, ';
            values.push(Csv_Label); 
        }
        
        if (Location !== undefined && Location !== '') {
            sql += 'Location = ?, ';
            values.push(Location);
        }
        if (Portal_Status !== undefined && Portal_Status !== '') {
            sql += 'Portal_Status = ?, ';
            values.push(Portal_Status);
        }
        
        if (Whatsapp_Status !== undefined && Whatsapp_Status !== '') {
            sql += 'Whatsapp_Status = ?, ';
            values.push(Whatsapp_Status);
        }
        if (date !== undefined && date !== '') {
            sql += 'date = ?, ';
            values.push(date);
        }
        if (description !== undefined && description !== '') {
            sql += 'description = ?, ';
            const trimmedDescription = description.slice(3, -4);
            values.push(trimmedDescription);
        }
        if (status !== undefined && status !== '') {
            sql += 'status = ?, ';
            values.push(status);
        }
        if (del !== undefined && del !== '') {
            sql += 'del = ?, ';
            values.push(del);
        }
        if (user !== undefined && user !== '') {
            sql += 'user = ?, ';
            values.push(user);
        }
        if (dt !== undefined && dt !== '') {
            sql += 'dt = ?, ';
            values.push(dt);
        }

        // Remove the trailing comma and space
        sql = sql.slice(0, -2);

        // Add the WHERE clause to specify the project to update based on Csv_Label
        sql += ' WHERE id = ?';
        values.push(id);

        // Execute the query
        await mysqlConnection.promise().query(sql, values);

        res.status(200).json({
            success: true,
            message: `Project updated successfully`,
        });
    } catch (error) {
        console.error('Error updating project:', error);
        return res.status(500).json({
            success: false,
            message: `Error in updating project`,
            error: error.message,
        });
    }
};



//get the specific project details
const GetProjectDetails = async (req, res) => {
    try {
      const { id } = req.params; 
      const [user] = await mysqlConnection.promise().query('SELECT * FROM lead_projects WHERE id = ?', [id]);
  
      if (!user.length) {
        return res.status(404).json({
          success: false,
          message: 'Id is not defined',
        });
      }
  
      // Respond with user information
      res.status(200).json({
        success: true,
        message: 'Project data fetched successfully',
        user: {
          id: user[0].id,
          name: user[0].name,
          status: user[0].status,
          Whatsapp_Sort: user[0].Whatsapp_Sort,
          Whatsapp_Status: user[0].Whatsapp_Status,
          Portal_Status: user[0].Portal_Status,
        //   Image: user[0].Image,
          Location: user[0].Location,
          description: user[0].description,
        },
      });
    } catch (error) {
      console.error('Error fetching Project Data:', error);
      res.status(500).json({
        success: false,
        message: 'Error in fetching Project Data',
        error: error.message,
      });
    }
  };
//delete project

module.exports = { projectData,GetStatus, CreateNewProject,GetProjectDetails,UpdateProject };
