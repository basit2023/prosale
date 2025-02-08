const mysqlConnection = require('../../utils/database');
// Controller to create a new PaymentPlan and PaymentPlanDetails
const createNewPaymentPlan = async (req, res) => {
    try {
        const { preset_name, preset_year, Category, Unit, Size, Price_Sqft } = req.body;

        // Insert into PaymentPlan
        const paymentPlanQuery = `
            INSERT INTO PaymentPlan (preset_name, preset_year, Category, Unit, Size, Price_Sqft)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const paymentPlanValues = [
            preset_name || '',
            preset_year || 0,
            Category || '',
            Unit || '',
            Size || '',
            Price_Sqft || ''
        ];

        // Using your preferred style for MySQL query and destructuring the result
        let [result] = await mysqlConnection.promise().query(paymentPlanQuery, paymentPlanValues);
        const paymentplan_id = result.insertId; // Get the inserted ID

        // Destructure fields for PaymentPlanDetails
        const {
            Add_Booking, booking_pr, add_confirmation, confirmation_Pr, add_allocation,
            allocation_pr, monthly, monthly_Installments, monthly_Installmentspr, halfyearly,
            half_yearly_Installments, half_yearly_Installmentspr, yearly, yearly_Installments,
            yearly_Installmentspr,  possession, possessionpr,
            transfer, transferpr, extrapr1, extrapr2, extrapr3, extrapr4, extrapr5,
            extrainstall1, extrainstall2, extrainstall3, extrainstall4, extrainstall5,
            extraname1, extraname2,
            extraname3,
            extraname4,
            extraname5,
            extra1,
            extra2,
            extra3,
            extra4,
            extra5
        } = req.body;

        // Insert into PaymentPlanDetails
        const paymentPlanDetailsQuery = `
            INSERT INTO PaymentPlanDetails (
                paymentplan_id, Add_Booking, booking_pr, add_confirmation, confirmation_Pr,
                add_allocation, allocation_pr, monthly, monthly_Installments, monthly_Installmentspr,
                halfyearly, half_yearly_Installments, half_yearly_Installmentspr, yearly, yearly_Installments,
                yearly_Installmentspr, possession, possessionpr, transfer, transferpr, extrapr1, extrapr2,
                extrapr3, extrapr4, extrapr5, extrainstall1, extrainstall2, extrainstall3, extrainstall4,
                extrainstall5, extraname1, extraname2, extraname3, extraname4, extraname5, extra1, extra2,
                extra3, extra4, extra5
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const paymentPlanDetailsValues = [
            paymentplan_id,
            Add_Booking || false,
            booking_pr || '',
            add_confirmation || false,
            confirmation_Pr || '',
            add_allocation || false,
            allocation_pr || '',
            monthly || false,
            monthly_Installments || '',
            monthly_Installmentspr || '',
            halfyearly || false,
            half_yearly_Installments || '',
            half_yearly_Installmentspr || '',
            yearly || false,
            yearly_Installments || '',
            yearly_Installmentspr || '',
            possession || false,
            possessionpr || '',
            transfer || false,
            transferpr || '',
            extrapr1 || '',
            extrapr2 || '',
            extrapr3 || '',
            extrapr4 || '',
            extrapr5 || '',
            extrainstall1 || '',
            extrainstall2 || '',
            extrainstall3 || '',
            extrainstall4 || '',
            extrainstall5 || '',
            extraname1 || '',
            extraname2 || '',
            extraname3 || '',
            extraname4 || '',
            extraname5 || '',
            extra1 || '',
            extra2 || '',
            extra3 || '',
            extra4 || '',
            extra5 || ''
        ];

        // Perform the insert into PaymentPlanDetails
        await mysqlConnection.promise().query(paymentPlanDetailsQuery, paymentPlanDetailsValues);

        // If everything goes well, send success response
        res.status(201).json({ message: 'Payment plan and details created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating payment plan or details' });
    }
};


const paymentData = async (req, res) => {
     const {id}=req.query;
    try {
        // [user]=await mysqlConnection.promise().query('SELECT company_id from users where email=?',[email])
        let projects;
        if(id){
            [projects] = await mysqlConnection.promise().query(`
                SELECT 
                    *
                FROM 
                    PaymentPlan pp 
                    INNER JOIN
                       PaymentPlanDetails ppd ON pp.id=ppd.paymentplan_id
                       where pp.id=?;`,[id]);
        
        
                if (!projects.length) {
                    return res.status(200).json({
                        success: true,
                        message: 'No projects found',
                    });
                }
             
               return  res.status(200).json({
                    success: true,
                    message: 'Projects information fetched successfully',
                    projects: projects,
                });
        }
     [projects] = await mysqlConnection.promise().query(`
            SELECT 
                pp.*, 
                ppd.*, 
                pp.id AS ppid,
                IFNULL(GROUP_CONCAT(lp.name), '') AS project_names
            FROM 
                PaymentPlan pp
            INNER JOIN 
                PaymentPlanDetails ppd ON pp.id = ppd.paymentplan_id
            LEFT JOIN 
                lead_projects lp ON FIND_IN_SET(lp.id, pp.projectid) > 0
            GROUP BY 
                pp.id, ppd.id;
        `);
        
        // Now, process the project_names to ensure they show correctly for each box
        const formattedProjects = projects.map(project => ({
            ...project,
            project_names: project.project_names ? project.project_names.split(',') : undefined
        }));


        if (!projects.length) {
            return res.status(200).json({
                success: true,
                message: 'No projects found',
            });
        }
     
        res.status(200).json({
            success: true,
            message: 'All projects information fetched successfully',
            projects: formattedProjects,
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
const GetSpecificPyammentplan = async (req, res) => {
    try {
        const { id } = req.query;
        let projects;
        [projects] = await mysqlConnection.promise().query(`
        SELECT 
            *
        FROM 
            PaymentPlan pp
        INNER JOIN
            PaymentPlanDetails ppd ON pp.id = ppd.paymentplan_id
        WHERE 
            pp.id = ?`, [id]);  

        if (!projects.length) {
            return res.status(200).json({
                success: true,
                message: 'No projects found',
            });
        }
        const formattedProjects = projects.map(project => {
            const extrasArray = [];

            for (let i = 1; i <= 5; i++) {
                extrasArray.push({
                    [`extra${i}`]: project[`extra${i}`],
                    [`extrainstall${i}`]: project[`extrainstall${i}`],
                    [`extrapr${i}`]: project[`extrapr${i}`],
                    [`extraname${i}`]: project[`extraname${i}`]
                });
            }
            

            return {
                ...project,
                extras: extrasArray // This array now holds all extra-related fields
            };
        });
        res.status(200).json({
            success: true,
            message: 'Payment plan information fetched successfully',
            payment: formattedProjects,
        });
    } catch (error) {
        console.error('Error fetching payment plan information:', error);
        res.status(500).json({
            success: false,
            message: 'Error in fetching payment plan information',
            error: error.message,
        });
    }
};

const DeletePaymentplan = async (req, res) => {
    const { id } = req.body;

    try {
        // Begin transaction
        await mysqlConnection.promise().beginTransaction();

        // First, delete the related rows in PaymentPlanDetails
        const [deleteDetails] = await mysqlConnection.promise().query(
            'DELETE FROM PaymentPlanDetails WHERE paymentplan_id = ?',
            [id]
        );

        // Then, delete the row in PaymentPlan
        const [deletePlan] = await mysqlConnection.promise().query(
            'DELETE FROM PaymentPlan WHERE id = ?',
            [id]
        );

        // Commit transaction if both deletes succeed
        await mysqlConnection.promise().commit();

        // Respond with a success message
        res.status(200).send({
            message: 'Payment plan deleted successfully',
            success: true,
        });
    } catch (error) {
        console.error('Error in deleting the payment plan and details:', error);
        await mysqlConnection.promise().rollback(); // Rollback the transaction in case of an error
        res.status(500).send({ error: 'Server error', success: false });
    }
};
const LinkProject = async (req, res) => {
    const { projectid, id } = req.body;

    try {
        // Fetch the current projectid value from the PaymentPlan table
        const [rows] = await mysqlConnection.promise().query(
            'SELECT projectid FROM PaymentPlan WHERE id = ?',
            [id]
        );

        let newProjectIdValue = projectid; // Default to the new projectid

        // If a record exists, check the existing projectid value
        if (rows.length > 0) {
            const currentProjectIds = rows[0].projectid;

            // If current projectid exists, check if the new projectid is already there
            if (currentProjectIds) {
                const projectIdArray = currentProjectIds.split(',');

                // Check if the new projectid is already linked
                if (projectIdArray.includes(projectid)) {
                    return res.status(400).send({
                        message: 'This project is already linked',
                        success: false,
                    });
                }

                // Append the new projectid as a comma-separated value
                newProjectIdValue = `${currentProjectIds},${projectid}`;
            }
        }

        // If no projectid is present, simply insert the new projectid
        await mysqlConnection.promise().query(
            'UPDATE PaymentPlan SET projectid = ? WHERE id = ?',
            [newProjectIdValue, id]
        );

        // Respond with a success message
        res.status(200).send({
            message: 'Project linked successfully',
            success: true,
        });
    } catch (error) {
        console.error('Error in linking the project to the payment plan:', error);
        res.status(500).send({ error: 'Server error', success: false });
    }
};



const GetPaymentPlan = async (req, res) => {
    try {
        const { company_id, slug} = req.query;
     console.log("the slug and the id is at the getpaymentplan",slug, company_id)
        // Step 1: Fetch comma-separated payment_ids from lead_projects table
        const [leadProjectRows] = await mysqlConnection.promise().query(`
            SELECT payment_ids
            FROM lead_projects
            WHERE company_id = ?
              AND status = "N"
              AND slug=?;
        `, [company_id,slug]);
      console.log("the leadprojectrows is:",leadProjectRows)
        // Extract the payment_ids (assuming there's only one row, adjust if needed)
        const paymentIdsString = leadProjectRows.length ? leadProjectRows[0].payment_ids : null;
      console.log("the string after taking the ids is:",paymentIdsString)
        
        if (!leadProjectRows) {
            return res.status(404).json({
                success: false,
                message: 'No payment IDs found for the provided company_id'
            });
        }

        // Step 2: Split the payment_ids string into an array of individual IDs
        const paymentIdsArray = paymentIdsString.split(',').map(id => id.trim());

        // Step 3: Fetch the id and preset_year from PaymentPlan table where id matches
        const [paymentPlanRows] = await mysqlConnection.promise().query(`
            SELECT id, preset_year
            FROM paymentplan
            WHERE id IN (?);
        `, [paymentIdsArray]);

        // Step 4: Prepare the response data (id and preset_year as name)
        const data = paymentPlanRows.map(row => ({
            name: row.preset_year,
            value: String(row.id),
        }));

        // Step 5: Send the result back to the frontend
        res.status(200).json({
            success: true,
            data,
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


const GetTemplates = async (req, res) => {
    try {
        const { id, slug } = req.query;

        // Use a connection pool to handle connections
    
        const [paymentPlanRows] = await mysqlConnection.promise().query(`
            SELECT id, template_name,template_content
            FROM templates
            WHERE id=?;
        `, [id]);

        // Step 4: Prepare the response data (id and preset_year as name)
        // const data = paymentPlanRows.map(row => ({
        //     name: row.template_name,
        //     value: String(row.id),
        // }));
     

        // Respond with an array of objects containing the floor name
        res.status(200).json({
            success: true,
            message: 'Data fetched successfully',
            data: paymentPlanRows,
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

const GetTemplatesUnits = async (req, res) => {
    try {
        const { id, pyamentplain_id } = req.query;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameter: id',
            });
        }
        const [projectId] = await mysqlConnection.promise().query(`
            SELECT id FROM project_floors WHERE floor_id=?`, [id]);
        console.log("the project is:",projectId[0].id)
        // Use a connection pool to handle connections
        const [paymentPlanRows] = await mysqlConnection.promise().query(`
            SELECT 
                Category,
                GROUP_CONCAT(Unit ORDER BY Unit) AS Unit_Grouped,
                SqFtRate,
                Size,
                project_floor_id,
                Extra, 
                Label, 
                remarks, 
                user
            FROM 
                floor_units
            WHERE project_floor_id = ?
            GROUP BY 
                Category, 
                SqFtRate, 
                Size,
                Type,
                Extra, 
                Label, 
                remarks, 
                user
            ORDER BY 
                CASE 
                    WHEN Category IS NULL THEN Size
                    ELSE Category
                    END;
        `, [projectId[0].id]);
        const [Unitspr] = await mysqlConnection.promise().query(`
            SELECT pp.*, ppd.*
            FROM paymentplan pp
            INNER JOIN paymentplandetails ppd ON pp.id = ppd.paymentplan_id
            WHERE pp.id = ?;
        `, [pyamentplain_id]);
        
   
        
        // Respond with an array of objects containing the floor data
        return res.status(200).json({
            success: true,
            message: 'Data fetched successfully',
            data: paymentPlanRows,
            Unitspr:Unitspr,
        });

    } catch (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({
            success: false,
            message: 'Error in fetching data',
            error: error.message,
        });
    }
};


const GetPaymentPlanid = async (req, res) => {

    try {
        const {company_id,slug}=req.query;
        // Use a connection pool to handle connections
        const [rows, fields] = await mysqlConnection.promise().query(`
            SELECT id
            FROM lead_projects 
            WHERE FIND_IN_SET(company_id, ?) > 0 
              AND status = "N" and slug=?;
        `, [company_id,slug]);

        // Respond with an array of objects containing name and sign
        const [rows1, fields1] = await mysqlConnection.promise().query(`
            SELECT id, preset_year
            FROM paymentplan
            WHERE FIND_IN_SET(?, projectid) > 0
        `, [rows[0].id]);
        
        const data = rows1.map(row => ({
            name: row.preset_year + " Years",
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




const UpdatePaymentPlan = async (req, res) => {
    try {
        // Destructure the incoming data from the request body
        const {
            id, preset_name, preset_year, Category, Unit, Size, Price_Sqft,
            Add_Booking, booking_pr, add_confirmation, confirmation_Pr, 
            add_allocation, allocation_pr, monthly, monthly_Installments, 
            monthly_Installmentspr, halfyearly, half_yearly_Installments, 
            half_yearly_Installmentspr, yearly, yearly_Installments, 
            yearly_Installmentspr, possession, possessionpr, transfer, transferpr,
            extrapr1, extrapr2, extrapr3, extrapr4, extrapr5, extrainstall1, 
            extrainstall2, extrainstall3, extrainstall4, extrainstall5, 
            extraname1, extraname2, extraname3, extraname4, extraname5, 
            extra1, extra2, extra3, extra4, extra5
        } = req.body;
        console.log("the body is:",req.body)

        let sql = '';
        let values = [];

        // Step 1: Update the PaymentPlan table
        if (id !== undefined) {
            sql = 'UPDATE PaymentPlan SET ';
            values = [];

            if (preset_name !== undefined || preset_name !== '') {
                sql += 'preset_name = ?, ';
                values.push(preset_name);
            }
            if (preset_year !== undefined || preset_year !== '') {
                sql += 'preset_year = ?, ';
                values.push(preset_year);
            }
            if (Category !== undefined || Category !== '') {
                sql += 'Category = ?, ';
                values.push(Category);
            }
            if (Unit !== undefined || Unit !== '') {
                sql += 'Unit = ?, ';
                values.push(Unit);
            }
            if (Size !== undefined || Size !== '') {
                sql += 'Size = ?, ';
                values.push(Size);
            }
            if (Price_Sqft !== undefined || Price_Sqft !== '') {
                sql += 'Price_Sqft = ?, ';
                values.push(Price_Sqft);
            }

            // Remove trailing comma and space
            sql = sql.slice(0, -2);

            // Add the WHERE clause for updating the correct PaymentPlan
            sql += ' WHERE id = ?';
            values.push(id);

            // Execute the query for PaymentPlan update
            await mysqlConnection.promise().query(sql, values);
        }

        // Step 2: Update the PaymentPlanDetails table
        if (id !== undefined) {
            sql = 'UPDATE PaymentPlanDetails SET ';
            values = [];

            if (Add_Booking !== undefined) {
                sql += 'Add_Booking = ?, ';
                values.push(Add_Booking);
            }
            if (booking_pr !== undefined) {
                sql += 'booking_pr = ?, ';
                values.push(booking_pr);
            }
            if (add_confirmation !== undefined) {
                sql += 'add_confirmation = ?, ';
                values.push(add_confirmation);
            }
            if (confirmation_Pr !== undefined) {
                sql += 'confirmation_Pr = ?, ';
                values.push(confirmation_Pr);
            }
            if (add_allocation !== undefined) {
                sql += 'add_allocation = ?, ';
                values.push(add_allocation);
            }
            if (allocation_pr !== undefined) {
                sql += 'allocation_pr = ?, ';
                values.push(allocation_pr);
            }
            if (monthly !== undefined) {
                sql += 'monthly = ?, ';
                values.push(monthly);
            }
            if (monthly_Installments !== undefined) {
                sql += 'monthly_Installments = ?, ';
                values.push(monthly_Installments);
            }
            if (monthly_Installmentspr !== undefined) {
                sql += 'monthly_Installmentspr = ?, ';
                values.push(monthly_Installmentspr);
            }
            if (halfyearly !== undefined) {
                sql += 'halfyearly = ?, ';
                values.push(halfyearly);
            }
            if (half_yearly_Installments !== undefined) {
                sql += 'half_yearly_Installments = ?, ';
                values.push(half_yearly_Installments);
            }
            if (half_yearly_Installmentspr !== undefined) {
                sql += 'half_yearly_Installmentspr = ?, ';
                values.push(half_yearly_Installmentspr);
            }
            if (yearly !== undefined) {
                sql += 'yearly = ?, ';
                values.push(yearly);
            }
            if (yearly_Installments !== undefined) {
                sql += 'yearly_Installments = ?, ';
                values.push(yearly_Installments);
            }
            if (yearly_Installmentspr !== undefined) {
                sql += 'yearly_Installmentspr = ?, ';
                values.push(yearly_Installmentspr);
            }
            if (possession !== undefined) {
                sql += 'possession = ?, ';
                values.push(possession);
            }
            if (possessionpr !== undefined) {
                sql += 'possessionpr = ?, ';
                values.push(possessionpr);
            }
            if (transfer !== undefined) {
                sql += 'transfer = ?, ';
                values.push(transfer);
            }
            if (transferpr !== undefined) {
                sql += 'transferpr = ?, ';
                values.push(transferpr);
            }

            // Handle the extra fields for installments and additional data
            if (extrapr1 !== undefined) {
                sql += 'extrapr1 = ?, ';
                values.push(extrapr1);
            }
            if (extrapr2 !== undefined) {
                sql += 'extrapr2 = ?, ';
                values.push(extrapr2);
            }
            if (extrapr3 !== undefined) {
                sql += 'extrapr3 = ?, ';
                values.push(extrapr3);
            }
            if (extrapr4 !== undefined) {
                sql += 'extrapr4 = ?, ';
                values.push(extrapr4);
            }
            if (extrapr5 !== undefined) {
                sql += 'extrapr5 = ?, ';
                values.push(extrapr5);
            }
            if (extrainstall1 !== undefined) {
                sql += 'extrainstall1 = ?, ';
                values.push(extrainstall1);
            }
            if (extrainstall2 !== undefined) {
                sql += 'extrainstall2 = ?, ';
                values.push(extrainstall2);
            }
            if (extrainstall3 !== undefined) {
                sql += 'extrainstall3 = ?, ';
                values.push(extrainstall3);
            }
            if (extrainstall4 !== undefined) {
                sql += 'extrainstall4 = ?, ';
                values.push(extrainstall4);
            }
            if (extrainstall5 !== undefined) {
                sql += 'extrainstall5 = ?, ';
                values.push(extrainstall5);
            }
            if (extraname1 !== undefined) {
                sql += 'extraname1 = ?, ';
                values.push(extraname1);
            }
            if (extraname2 !== undefined) {
                sql += 'extraname2 = ?, ';
                values.push(extraname2);
            }
            if (extraname3 !== undefined) {
                sql += 'extraname3 = ?, ';
                values.push(extraname3);
            }
            if (extraname4 !== undefined) {
                sql += 'extraname4 = ?, ';
                values.push(extraname4);
            }
            if (extraname5 !== undefined) {
                sql += 'extraname5 = ?, ';
                values.push(extraname5);
            }
            if (extra1 !== undefined) {
                sql += 'extra1 = ?, ';
                values.push(extra1);
            }
            if (extra2 !== undefined) {
                sql += 'extra2 = ?, ';
                values.push(extra2);
            }
            if (extra3 !== undefined) {
                sql += 'extra3 = ?, ';
                values.push(extra3);
            }
            if (extra4 !== undefined) {
                sql += 'extra4 = ?, ';
                values.push(extra4);
            }
            if (extra5 !== undefined) {
                sql += 'extra5 = ?, ';
                values.push(extra5);
            }

            // Remove trailing comma and space
            sql = sql.slice(0, -2);

            // Add the WHERE clause for updating the correct PaymentPlanDetails
            sql += ' WHERE id = ? AND paymentplan_id = ?';
            values.push(id, id); // Assuming `id` in both tables is the same

            // Execute the query for PaymentPlanDetails update
            await mysqlConnection.promise().query(sql, values);
        }

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

module.exports = {UpdatePaymentPlan, GetPaymentPlanid, GetTemplates, GetTemplatesUnits,  GetPaymentPlan, LinkProject, createNewPaymentPlan,paymentData,GetSpecificPyammentplan, DeletePaymentplan};
