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
            lp.slug,
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


const FloorsData = async (req, res) => {
    const { email, slug } = req.query;

    try {
        // Fetch the company_id associated with the provided email
        const [user] = await mysqlConnection.promise().query(
            'SELECT company_id FROM users WHERE email = ?', 
            [email]
        );

        if (!user.length) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const companyId = user[0].company_id;

        // Fetch the floor IDs related to the company and the provided slug
        const [floorIds] = await mysqlConnection.promise().query(
            'SELECT id FROM project_floors WHERE company_id = ? AND floor_slug = ? AND status = "N"',
            [companyId, slug]
        );
         console.log(`the floor found for the ${slug} is:${floorIds.length}`)
        
  
        if (!floorIds.length) {
            return res.status(200).json({
                success: true,
                message: 'No floors found',
            });
        }

        // Extract the floor IDs into an array
        const floorIdsArray = floorIds.map(floor => floor.id);

 

        // Fetch the floors and units that match the floor IDs and slug
        const [floors] = await mysqlConnection.promise().query(`
            SELECT 
                f.id,
                pf.id AS p_id,
                f.floor_name,
                pf.floor_slug AS slug
            FROM 
                floors f
            INNER JOIN 
                project_floors pf ON f.id = pf.floor_id 
            WHERE 
                pf.company_id = ? 
                AND pf.floor_slug = ?
                AND pf.status= "N";
        `, [companyId, slug]);
      
        if (!floors.length) {
            return res.status(200).json({
                success: true,
                message: 'No matching floors found',
            });
        }

        // Fetch the units counts for each floor
        const [unitsCounts] = await mysqlConnection.promise().query(`
            SELECT 
                fu.project_floor_id,
                COUNT(*) AS total_units,
                SUM(CASE WHEN fu.status = 'Sold' THEN 1 ELSE 0 END) AS sold_units,
                SUM(CASE WHEN fu.status = 'On Hold' THEN 1 ELSE 0 END) AS hold_units,
                SUM(CASE WHEN fu.status = 'Available' THEN 1 ELSE 0 END) AS available_units,
                SUM(fu.Size) AS size,
                MAX(fu.SqFtRate) AS SqFtRate
            FROM 
                floor_units fu
            WHERE 
                fu.project_floor_id IN (?)
            GROUP BY fu.project_floor_id;
        `, [floorIdsArray]);
   
        // Merge the units counts with the corresponding floors
        const floorsWithCounts = floors.map(floor => {
            const matchingCounts = unitsCounts.find(count => count.project_floor_id == floor.p_id);
      
            return {
                ...floor,
                unitsCounts: matchingCounts || {
                    total_units: 0,
                    sold_units: 0,
                    hold_units: 0,
                    available_units: 0,
                    size: 0,
                    SqFtRate:0,
                },
            };
        });

        return res.status(200).json({
            success: true,
            message: 'Matching floors information fetched successfully',
            floors: floorsWithCounts,
        });
    } catch (error) {
        console.error('Error fetching floor information:', error);
        return res.status(500).json({
            success: false,
            message: 'Error in fetching floor information',
            error: error.message,
        });
    }
};








const ManageUnits = async (req, res) => {
    const { email, floor_slug, floor_id } = req.query;

    try {
        // Fetch the company_id associated with the provided email
        const [user] = await mysqlConnection.promise().query('SELECT company_id FROM users WHERE email = ?', [email]);

        if (!user.length) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const companyId = user[0].company_id;
       console.log("the project id and the slug:",floor_slug,floor_id) 
        const [floor] = await mysqlConnection.promise().query(
            'SELECT id FROM project_floors WHERE floor_slug = ? AND floor_id = ?', 
            [floor_slug, floor_id]
        );
        console.log("the floors is at units:",floor)
        // Fetch the floors related to the company and the provided slug
        const [floors] = await mysqlConnection.promise().query(`
            SELECT 
               id,
                total_units,
                sold_units,
                hold_units,
                available_units,
                status, 
                Type,  Unit, Size, SqFtRate, Category, Label, Extra
            FROM 
                floor_units
            WHERE 
                project_floor_id =?;
        `, [floor[0].id]);

        if (!floors.length) {
            return res.status(200).json({
                success: true,
                message: 'No floors found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'All floors information fetched successfully',
            floors: floors,
        });
    } catch (error) {
        console.error('Error fetching floor information:', error);
        return res.status(500).json({
            success: false,
            message: 'Error in fetching floor information',
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
            Whatsapp_Status, date, description, status, del, user, dt, company_id } = req.body;
        
        const prefixedBase64String = `data:image/jpeg;base64,${req.body.Image}`;
        const Csv_Label = name.replace(/\s/g, '_'); // Replace spaces with underscores

        // Generate slug from name: replace spaces with hyphens, convert to lowercase, remove special characters
        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

        let sql = '';
        let values = [];

        // Check if Csv_Label or slug already exists
        const checkSql = 'SELECT COUNT(*) AS count FROM lead_projects WHERE Csv_Label = ? OR slug = ?';
        const [checkResult] = await mysqlConnection.promise().query(checkSql, [Csv_Label, slug]);
        const existingCount = checkResult[0].count;

        if (existingCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Csv_Label or Slug already exists. Please choose a different name.',
            });
        } else {
            // Fetch the count of existing rows
            const getCountSql = 'SELECT COUNT(*) AS rowCount FROM lead_projects';
            const [rowCountResult] = await mysqlConnection.promise().query(getCountSql);
            const rowCount = rowCountResult[0].rowCount;

            // Increment rowCount by 1 and use it for Whatsapp_Sort
            const updatedWhatsappSort = rowCount + 1;

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
            if (slug !== undefined && slug !== '') {
                sql += 'slug = ?, ';  // Insert the generated slug
                values.push(slug);
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


//get projects name 
const GetProjects = async (req, res) => {

    try {
        const {company_id}=req.query;
        // Use a connection pool to handle connections
        const [rows, fields] = await mysqlConnection.promise().query(`
            SELECT id, name 
            FROM lead_projects 
            WHERE FIND_IN_SET(company_id, ?) > 0 
              AND status = "N";
        `, [company_id]);

        // Respond with an array of objects containing name and sign
        const data = rows.map(row => ({
            name: row.name,
            value: String(row.id),
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

const AllFloors= async (req, res) => {
    try {
      // Use a connection pool to handle connections
      const [rows, fields] = await mysqlConnection.promise().query('SELECT id, floor_name FROM floors');
     
      // Extract names from the result and construct objects with same name and value
      const show_labels = rows.map(label => ({ name: label.floor_name, value: label.id }));
  
      // Respond with office names array
      res.status(200).json({
        success: true,
        message: 'All floor successfully',
        floors: show_labels,
      });
    } catch (error) {
      console.error('Error fetching all floors:', error);
      res.status(500).json({
        success: false,
        message: 'Error in fetching all floors',
        error: error.message,
      });
    }
  };


  const NewFloor = async (req, res) => {
    const { floor_name, company_id, slug } = req.body;
  
    if (!floor_name) {
      return res.status(400).json({ error: 'Floor name is required' });
    }
  
    try {
      // Assuming you are using a MySQL database
      const sql = 'INSERT INTO floors SET ?';
      const values = { floor_name, company_id, slug };
  
      // Execute the query using your database connection (e.g., MySQL)
      // Assuming `mysqlConnection` is your database connection object
      mysqlConnection.query(sql, values, (error, results) => {
        if (error) {
          console.error('Error inserting floor name:', error);
          return res.status(500).json({ error: 'Database error' });
        }
  
        res.status(201).send({ message: 'Floor name added successfully',success:true, id: results.insertId });
      });
    } catch (error) {
      console.error('Error in NewFloor handler:', error);
      res.status(500).send({ error: 'Server error', sucess:false });
    }
  };
  
  // project floor

  const UpdateProjectFloor = async (req, res) => {
    try {
        let { id, status, description, floor_slug, floor_id, date, project_name, company_id } = req.body;

        // Ensure there's something to update
        if (!status && !description && !date && !floor_id && !company_id) {
            return res.status(400).json({
                success: false,
                message: 'No changes were made. Please provide fields to update.',
            });
        }
         description = description?.replace(/<\/?p>/g, '');
        // Start building the SQL query dynamically
        let sql = 'UPDATE project_floors SET ';
        let values = [];

        // Conditionally add fields to the query
        if (status !== undefined && status !== '') {
            sql += 'status = ?, ';
            values.push(status);
        }
        if (description !== undefined && description !== '') {
            sql += 'description = ?, ';
            values.push(description);
        }
        if (floor_id !== undefined && floor_id !== '') {
            sql += 'floor_id = ?, ';
            values.push(floor_id);
        }
        if (date !== undefined && date !== '') {
            sql += 'date = ?, ';
            values.push(date);
        }
        if (company_id !== undefined && company_id !== '') {
            sql += 'company_id = ?, ';
            values.push(company_id);
        }

        // Remove trailing comma and space from the SQL string
        sql = sql.slice(0, -2);

        // Add WHERE clause to specify which floor to update
        sql += ' WHERE floor_slug = ? AND floor_id = ?';
        values.push(floor_slug, id);

        // Execute the query
        await mysqlConnection.promise().query(sql, values);

        return res.status(200).json({
            success: true,
            message: 'Floor updated successfully.',
        });
    } catch (error) {
        console.error('Error updating Floor:', error);
        return res.status(500).json({
            success: false,
            message: 'Error in updating Floor',
            error: error.message,
        });
    }
};

module.exports = {UpdateProjectFloor, NewFloor, ManageUnits, FloorsData, AllFloors, projectData,GetStatus, CreateNewProject,GetProjectDetails,UpdateProject,GetProjects};
