const mysqlConnection = require('../../utils/database');
const AddNewFloor = async (req, res) => {
    const { floor_name, status, company_id, date, description, slug } = req.body;

    try { 
        // Get the project ID based on the project slug
        const [projectResult] = await mysqlConnection.promise().query(
            'SELECT id FROM lead_projects WHERE slug = ?',
            [slug]
        );

        // Check if the project exists
        if (projectResult.length === 0) {
            return res.status(404).json({ error: 'Project not found', success: false });
        }

        const project_id = projectResult[0].id;
        const floor_id = floor_name;

        // Remove <p> tags from the description
        const cleanDescription = description.replace(/<\/?p>/g, '');

        // Define the values to be inserted into the project_floors table
        const values = {
            floor_id, 
            project_id,
            company_id,
            floor_slug: slug,
            status,
            description: cleanDescription,
            date,
        };

        // Insert the new floor into the project_floors table
        const [insertResult] = await mysqlConnection.promise().query(
            'INSERT INTO project_floors SET ?',
            values
        );

        // Respond with success message and the inserted row ID
        res.status(201).send({
            message: 'New Floor and Unit added successfully',
            success: true,
            
        });
    } catch (error) {
        console.error('Error in AddNewFloor handler:', error);
        res.status(500).send({ error: 'Server error', success: false });
    }
};


//update project
const UpdateUnits = async (req, res) => {
    try {
        const { id, status, remarks, Unit, Size, SqFtRate, Category, Label, Extra, inputValue } = req.body;

        // Check if only id is provided without any updates
        if (!status && !remarks && !Unit && !Size && !SqFtRate && !Category && !Label && !Extra && !inputValue) {
            return res.status(400).json({
                success: false,
                message: 'No changes were made. Please provide fields to update.',
            });
        }

        let sql = '';
        let values = [];

        if (inputValue) {
            sql = `UPDATE floor_units SET SqFtRate = ? WHERE project_floor_id = ?`;
            values.push(inputValue, id);

            // Execute the query for updating all rows where project_floor_id matches
            await mysqlConnection.promise().query(sql, values);

            return res.status(200).json({
                success: true,
                message: 'Rates updated successfully for all matching rows.',
            });
        }

        // Build the UPDATE query based on the provided fields in the request body
        sql = `UPDATE floor_units SET `;
        values = [];

        if (status !== undefined && status !== '') {
            sql += 'status = ?, ';
            values.push(status);
        }
        if (remarks !== undefined && remarks !== '') {
            sql += 'remarks = ?, ';
            values.push(remarks);
        }
        if (Unit !== undefined && Unit !== '') {
            sql += 'Unit = ?, ';
            values.push(Unit);
        }
        if (Size !== undefined && Size !== '') {
            sql += 'Size = ?, ';
            values.push(Size);
        }
        if (SqFtRate !== undefined && SqFtRate !== '') {
            sql += 'SqFtRate = ?, ';
            values.push(SqFtRate);
        }
        if (Category !== undefined && Category !== '') {
            sql += 'Category = ?, ';
            values.push(Category);
        }
        if (Label !== undefined && Label !== '') {
            sql += 'Label = ?, ';
            values.push(Label);
        }
        if (Extra !== undefined && Extra !== '') {
            sql += 'Extra = ?, ';
            values.push(Extra);
        }

        // Remove the trailing comma and space
        sql = sql.slice(0, -2);

        // Add the WHERE clause to specify the project to update based on id
        sql += ' WHERE id = ?';
        values.push(id);

        // Execute the query for the single row update
        await mysqlConnection.promise().query(sql, values);

        return res.status(200).json({
            success: true,
            message: 'Updated successfully.',
        });
    } catch (error) {
        console.error('Error updating Units:', error);
        return res.status(500).json({
            success: false,
            message: 'Error in updating Units',
            error: error.message,
        });
    }
};
const CreateNewUnits = async (req, res) => {
    try {
        const { id, slug, user, start, end, ...data } = req.body;
      console.log("the id and the slug is:",id,slug)
        const [projectResult] = await mysqlConnection.promise().query(
            'SELECT id FROM project_floors WHERE floor_slug = ? AND floor_id = ?',
            [slug, id]
        );

        // Check if the project exists
        if (projectResult.length === 0) {
            return res.status(404).send({ message: 'Project not found', success: false });
        }
        const project_id = projectResult[0].id;

        let [floors] = await mysqlConnection.promise().query(`
            SELECT 
                
                f.floor_name,
                count(*) AS total
            FROM 
                floors f
            INNER JOIN 
                project_floors pf ON f.id = pf.floor_id
            INNER JOIN 
                 floor_units fu ON pf.floor_id =fu.project_floor_id
            WHERE 
              
               fu.project_floor_id = ?
               AND pf.floor_slug=?;
        `, [project_id, slug]);
       
        const totalFloors = floors.length;
        
        if (!floors[0].floor_name) {
            // If floor_name is null, fetch the floor name using another query
            [floors] = await mysqlConnection.promise().query(`
                SELECT 
                    f.floor_name
                FROM 
                    floors f
                INNER JOIN 
                    project_floors pf ON f.id = pf.floor_id
                WHERE 
                    pf.floor_id = ?
                    AND pf.floor_slug = ?;
            `, [id, slug]);

            if (floors.length === 0 || !floors[0].floor_name) {
                return res.status(404).send({ message: 'Floor name not found', success: false });
            }
        }
// Extract the first character and the number after space from the floor name
let formattedFloorName = '';
if (totalFloors > 0) {
    const floorName = floors[0].floor_name;
    const firstChar = floorName.charAt(0).toUpperCase();
    const numberAfterSpace = floorName.split(' ')[1];
    formattedFloorName = `${firstChar}${numberAfterSpace}`;
}

const Label=`${formattedFloorName} - ${totalFloors+1}`

       

        if (start && end) {
            const count = end - start; 
            if(count<=0){
                return res.status(404).send({message:"Please Enter the units Greater then the starting", success:false})
            }
            for (let i = 0; i < count; i++) {
                let sql = 'INSERT INTO floor_units SET ';
                let values = [];

                if (project_id !== undefined && project_id !== '') {
                    sql += 'project_floor_id = ?, ';
                    values.push(project_id);
                }
                if (data.Type !== undefined && data.Type !== '') {
                    sql += 'Type = ?, ';
                    values.push(data.Type);
                }
                if (data.SqFtRate !== undefined && data.SqFtRate !== '') {
                    sql += 'SqFtRate = ?, ';
                    values.push(data.SqFtRate);
                }
                if (data.status !== undefined && data.status !== '') {
                    sql += 'status = ?, ';
                    values.push(data.status);
                }
                if (user !== undefined && user !== '') {
                    sql += 'user = ?, ';
                    values.push(user);
                }
                if (Label !== undefined && Label !== '') {
                    sql += 'Label = ?, ';
                    values.push(Label);
                }

                sql += 'Unit = ?, ';
                values.push(start + i); // Assign unit number based on the start value

                sql = sql.slice(0, -2); // Remove the trailing comma and space

                // Execute the query
                await mysqlConnection.promise().query(sql, values);
            }

            // Return success message after adding the units
            return res.status(201).json({ message: `${count} Units added successfully`, success: true });
        }

        // Iterate through each item in the data to insert into the database
        for (const key in data) {
            if (data.hasOwnProperty(key) && !isNaN(parseInt(key))) {
                const { Type, Unit, Size, SqFtRate, status, Category } = data[key];

                let sql = 'INSERT INTO floor_units SET ';
                let values = [];

                if (project_id !== undefined && project_id !== '') {
                    sql += 'project_floor_id = ?, ';
                    values.push(project_id);
                }
                if (Type !== undefined && Type !== '') {
                    sql += 'Type = ?, ';
                    values.push(Type);
                }
                if (Unit !== undefined && Unit !== '') {
                    sql += 'Unit = ?, ';
                    values.push(Unit);
                }
                if (Size !== undefined && Size !== '') {
                    sql += 'Size = ?, ';
                    values.push(Size);
                }
                if (SqFtRate !== undefined && SqFtRate !== '') {
                    sql += 'SqFtRate = ?, ';
                    values.push(SqFtRate);
                }
                if (status !== undefined && status !== '') {
                    sql += 'status = ?, ';
                    values.push(status);
                }
                if (Category !== undefined && Category !== '') {
                    sql += 'Category = ?, ';
                    values.push(Category);
                }
                if (user !== undefined && user !== '') {
                    sql += 'user = ?, ';
                    values.push(user);
                }
                if (Label !== undefined && Label !== '') {
                    sql += 'Label = ?, ';
                    values.push(Label);
                }

                sql = sql.slice(0, -2); // Remove the trailing comma and space

                // Execute the query
                await mysqlConnection.promise().query(sql, values);
            }
        }

        res.status(200).json({
            success: true,
            message: `New Units Created successfully`,
        });
    } catch (error) {
        console.error('Error Creating Units:', error);
        return res.status(500).json({
            success: false,
            message: `Error in creating Units`,
            error: error.message,
        });
    }
};




const UnitCounts = async (req, res) => {
    const {slug,id}=req.query;

    try {
        const [projectResult] = await mysqlConnection.promise().query(
            'SELECT id FROM project_floors WHERE floor_slug = ? AND floor_id=?',
            [slug, id]
        );

        // Check if the project exists
        if (projectResult.length === 0) {
            return res.status(404).json({ error: 'Project not found', success: false });
        }

        const project_id = projectResult[0].id;
        const [count] = await mysqlConnection.promise().query(`
        SELECT 
            
            count (*) AS total
        FROM 
            floor_units 
   
        WHERE 
            project_floor_id=?`, [project_id]);


      
        
        res.status(200).json({
            success: true,
            message: 'All projects information fetched successfully',
            count: count[0].total,
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
 




const AddDuplicateFloor = async (req, res) => {
    const { floor_name, status, company_id, date, description, slug, user,floor_id } = req.body;
     console.log("the floor id :",floor_id)
    try {
        // Get the project ID based on the project slug
        const [projectResult] = await mysqlConnection.promise().query(
            'SELECT id FROM lead_projects WHERE slug = ?',
            [slug]
        );

        // Check if the project exists
        if (projectResult.length === 0) {
            return res.status(404).json({ error: 'Project not found', success: false });
        }

        const project_id = projectResult[0].id;
        

        // Remove <p> tags from the description
        const cleanDescription = description.replace(/<\/?p>/g, '');
        
        // Define the values to be inserted into the project_floors table
        const values = {
            floor_id:floor_name,
            project_id,
            company_id,
            floor_slug: slug,
            status,
            description: cleanDescription,
            date,
        };

        // Insert the new floor into the project_floors table
        const [insertResult] = await mysqlConnection.promise().query(
            'INSERT INTO project_floors SET ?',
            values
        );

        // Get the ID of the newly created row
        const newFloorId = insertResult.insertId;
   
        // Retrieve the ID of the existing floor based on floor_slug and floor_id
        const [existingFloorResult] = await mysqlConnection.promise().query(
            'SELECT id FROM project_floors WHERE floor_slug = ? AND floor_id = ?',
            [slug, floor_id]
        );
  
        if (existingFloorResult.length === 0) {
            return res.status(404).json({ error: 'Existing floor not found', success: false });
        }

        const existingFloorId = existingFloorResult[0].id;

        // Copy all rows from floor_units where project_floor_id equals existingFloorId
        const [floorUnits] = await mysqlConnection.promise().query(
            'SELECT * FROM floor_units WHERE project_floor_id = ?',
            [existingFloorId]
        );
        
        if (floorUnits.length > 0) {
            // Prepare new rows with updated project_floor_id
            const newUnits = floorUnits.map(unit => ({
                ...unit,
                project_floor_id: newFloorId,
            }));
      
            await Promise.all(
                newUnits.map(async (unit) => {
                    const { project_floor_id, total_units, sold_units, hold_units, available_units, status, Type, Unit, Size, SqFtRate, Extra, Category, Label, remarks,  user } = unit;
                    await mysqlConnection.promise().query(
                        'INSERT INTO floor_units (project_floor_id, total_units, sold_units, hold_units, available_units, status, Type, Unit, Size, SqFtRate, Extra, Category, Label, remarks,  user) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        [project_floor_id, total_units, sold_units, hold_units, available_units, status, Type, Unit, Size, SqFtRate, Extra, Category, Label, remarks,  user]
                    );
                })
            );
        }

        // Respond with success message and the inserted row ID
        res.status(201).send({
            message: 'New Floor and Units added successfully',
            success: true,
        });
    } catch (error) {
        console.error('Error in AddNewFloor handler:', error);
        res.status(500).send({ error: 'Server error', success: false });
    }
};




//delte the floor is at the id is:


const DeleteProjectFloor = async (req, res) => {
    const { id, slug, single_unit } = req.body;
    console.log("the id and the slug is-->:",id, slug,single_unit)
    if(single_unit){
        await mysqlConnection.promise().query(
            'DELETE FROM floor_units WHERE id = ?',
            [id]
        );
        return res.status(200).send({
            message: 'Unit deleted successfully',
            success: true,
        });
    }
    try {
        // Fetch the floor ID from project_floors based on the provided slug and id
        const [existingFloorResult] = await mysqlConnection.promise().query(
            'SELECT id FROM project_floors WHERE floor_slug = ? AND floor_id = ?',
            [slug, id]
        );

        if (existingFloorResult.length === 0) {
            return res.status(404).json({ error: 'Floor not found', success: false });
        }

        const existingFloorId = existingFloorResult[0].id;

        // Delete all rows from floor_units where project_floor_id matches existingFloorId
        await mysqlConnection.promise().query(
            'DELETE FROM floor_units WHERE project_floor_id = ?',
            [existingFloorId]
        );

        // Delete the floor from project_floors
        await mysqlConnection.promise().query(
            'DELETE FROM project_floors WHERE id = ?',
            [existingFloorId]
        );

        // Respond with a success message
        res.status(200).send({
            message: 'Floor and associated units deleted successfully',
            success: true,
        });
    } catch (error) {
        console.error('Error in deleting the floor and units:', error);
        res.status(500).send({ error: 'Server error', success: false });
    }
};
const UpdateAllFloorRates = async (req, res) => {
    const { id, slug, SqFtRate } = req.body;
    console.log("The id and the slug is:", id, slug);
    try {
        // Fetch the floor ID from project_floors based on the provided slug and id
        const [existingFloorResult] = await mysqlConnection.promise().query(
            'SELECT id FROM project_floors WHERE floor_slug = ? AND floor_id = ?',
            [slug, id]
        );

        if (existingFloorResult.length === 0) {
            return res.status(404).json({ error: 'Floor not found', success: false });
        }

        const existingFloorId = existingFloorResult[0].id;

        // Update all SqFtRate in floor_units where project_floor_id matches existingFloorId
        await mysqlConnection.promise().query(
            'UPDATE floor_units SET SqFtRate = ? WHERE project_floor_id = ?',
            [SqFtRate, existingFloorId]
        );

        res.status(200).send({
            message: 'Updated Floor Rates Successfully',
            success: true,
        });
    } catch (error) {
        console.error('Error in Updating Floor Rates:', error);
        res.status(500).send({ error: 'Server error', success: false });
    }
};


//get all the floor.
const Getrequiredfloor = async (req, res) => {
    try {
        const { id, slug } = req.query;

        // Use a connection pool to handle connections
    
        const [rows] = await mysqlConnection.promise().query(
            `SELECT f.floor_name 
             FROM floors f 
             INNER JOIN project_floors pf 
             ON f.id = pf.floor_id 
             WHERE pf.floor_id = ? AND pf.floor_slug = ?`, 
             [id, slug]
        );
     
        // Check if data exists
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No data found for the provided id and slug',
            });
        }

        // Respond with an array of objects containing the floor name
        res.status(200).json({
            success: true,
            message: 'Data fetched successfully',
            data: rows[0].floor_name,
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




module.exports = {Getrequiredfloor, UpdateAllFloorRates, DeleteProjectFloor, AddNewFloor,UpdateUnits, CreateNewUnits,UnitCounts, AddDuplicateFloor };



// SELECT 
// f.id,
// f.floor_name,
// f.slug,
// fu.total_units,
// fu.sold_units,
// fu.available_units, 
// fu.status,
// fu.Type, 
// fu.Unit, 
// fu.Size, 
// fu.SqFtRate, 
// fu.Extra, 
// fu.Category, 
// fu.Label
// FROM 
// floor_units fu
// INNER JOIN 
// project_floors pf ON fu.project_floor_id = pf.id
// INNER JOIN 
// floors f ON pf.floor_id = f.id
// WHERE 
// pf.company_id = ? 
// AND pf.id IN (?);
// `, [companyId, floorIdsArray]);