const express = require("express");
const mysqlConnection = require("../utils/database");
const { loginHandler, loginHandlerA, checkSupperAdmin } = require('../Controller/LoginScema');
const { MenuItems } = require("../Controller/ManueItems");
const { Dropdown } = require("../Controller/ManueItems");
const { Userpermission, GetAllPermission } = require("../Controller/Userpermission");
const { DropDown } = require("../Controller/DropDown");
const { ForgetPassword, ResetPassword } = require("../Controller/ForgetPassword");
const { getPersonalInfoHandler, updatePersonalInfoHandler, getPersonalInfoHandlerbyId } = require("../Controller/Personalinfo");
const { UserDetails, createUserDetails,updateUserDetails} = require("../Controller/User_details/UserDetails");
const { UserLogs,GetUserLogs } = require("../Controller/logs/UserLogs");
const { AllEmployees } = require("../Controller/Employees/AllEmployees");
const { EmpOffice } = require("../Controller/Employees/EmpOffice");
const { getAllCompany, GetCompanies, GetSingleCompany } = require("../Controller/SupperAdmin/Getcompany");
const { DeleteEmployee } = require("../Controller/Employees/DeleteEmployee");
const { EmpgetPersonalInfo, EmpUpdatePersonalInfo } = require("../Controller/EditEmployInfo/PersonalInfoma");
const { EmployeeDetails, UpdateEmployeeDetails, CreateEmployeeDetails } = require("../Controller/EditEmployInfo/EmployeeDetails");
const { EmpOfficeDetails, AllDays, UpdateEmpOfficeandjobDetails, CreateEmpOfficeJobDetails, AllOffices } = require("../Controller/EditEmployInfo/EmployeeJobInfo");
const { GetEmployeeContectInfo, GetContracts, UpdateEmpContectInfo, CreateEmpJobInfo } = require("../Controller/EditEmployInfo/EmployeeContect");
const  { GetEmployeeSalaryInfo, GetRupeOrPer, UpdateEmpSalaryInfo, CreateEmpSalaryInfo }= require('../Controller/EditEmployInfo/EmpSalaryInfo');
const { GetDessignation, GetDepartment, GetUserType, CreateUser } = require("../Controller/EditEmployInfo/AddNewEmployee");
const { UpdateVaultInfo } = require("../Controller/EditEmployInfo/VaultInfo");
const { GetEmpStatus, UpdateStatusInfo } = require("../Controller/EditEmployInfo/Sms_LeadStatus");
const { All_lables, userPermission, TotalLead, UnaginedLead, All_labels, All_labelsForMember } = require("../Controller/LeadM/Card-leadsLable");
const { Highly_interested, highly_interested_table, GetLeadFromId, AllCustomers, HeaderLabel, SpecificTeamMemberLeads } = require("../Controller/LeadM/highly_interested");
const { CreateComments, GetComments, DeleteComments, AllLabels, SelectForBox, UpdateLabel } = require("../Controller/LeadM/Comments");
const { ClosedLeadController, ViewLead } = require("../Controller/LeadM/closeLeads");
const { EditLeadCustomer, UpdateLeadCustomer, GetCountrycode, CreateLeadCustomer, GetCustomerById } = require("../Controller/LeadM/EditLeadCustomer");
const { ZoneData, GetTeamMemeber, UpdateZoneTeam, TeamData, GetzoneMemeber, ZoneTeamData, CreateZoneTeam } = require("../Controller/Team&Zones/zones");
const { Getteamates, TeamForEmployee, UpdateTeamForEmployee, AddTeamMember } = require("../Controller/Team&Zones/Team");
const { projectData, GetStatus, CreateNewProject, GetProjectDetails, UpdateProject } = require("../Controller/Project/project");
const { ReassinedLead } = require("../Controller/LeadM/ReassignedLead");
const { SignUpHandler, OnBordingHandler } = require("../Controller/Signup");
const { customMiddleware } = require("../Controller/middleware/middleware");




const Router = express.Router();



Router.post('/api/login', loginHandler);
Router.post('/api/login-a', loginHandlerA);
Router.post('/api/signup', SignUpHandler);
Router.get('/api/supperadmin/:email',checkSupperAdmin)
Router.post('/api/onboarding/:email',OnBordingHandler)
Router.get('/api/items',MenuItems)
Router.get('/api/dropdown/:parent_id', DropDown)
Router.get('/api/permission/:email',Userpermission)
Router.get('/api/personalinfo/:email',getPersonalInfoHandler)
Router.get('/api/personalinfo-by-id/:id',getPersonalInfoHandlerbyId)
Router.put('/api/personalinfo/:email',updatePersonalInfoHandler)
Router.put('/api/forget-password/:email',ForgetPassword)
Router.put('/api/reset-password/',ResetPassword)
Router.get('/api/user-details/:email',UserDetails)
Router.post('/api/create_details',createUserDetails)
Router.put('/api/update_details/:email',updateUserDetails)
//create and get logs
Router.post('/api/logs',UserLogs)
Router.get('/api/logs/:email',GetUserLogs)
//get all employees form the table.
Router.get('/api/employees',AllEmployees)
Router.get('/api/office/:email', EmpOffice);
//delete the del i Mean change from N to Y
Router.put('/api/del/:id', DeleteEmployee);

//Employe Basic information
Router.get('/api/emp-personalinfo/:id',EmpgetPersonalInfo)
Router.put('/api/emp-personaleinfo/:id',EmpUpdatePersonalInfo)
//Employee personal information
Router.put('/api/update-employye-details/:id',UpdateEmployeeDetails)
Router.get('/api/get-employee-details/:id',EmployeeDetails)
Router.post('/api/create-employee-details',CreateEmployeeDetails)
Router.get('/api/employee-office/:id', EmpOfficeDetails);
//update employee job details
Router.put('/api/update-employee-office-job/:id', UpdateEmpOfficeandjobDetails);
//create employee job details
Router.post('/api/create-employee-office-job/:id', CreateEmpOfficeJobDetails);
//Employee Contect Details
Router.get('/api/employee-contect-info/:id', GetEmployeeContectInfo);
Router.put('/api/update_employee-contect-info/:id', UpdateEmpContectInfo);
Router.post('/api/create-employee-contect-info/:id', CreateEmpJobInfo);


//Employee salary salary info UpdateEmpSalaryInfo
Router.get('/api/employee-salary-info/:id', GetEmployeeSalaryInfo);
Router.put('/api/update_employee-salary-info/:id', UpdateEmpSalaryInfo);
Router.post('/api/create-employee-salary-info/:id', CreateEmpSalaryInfo); 
//Update Employee VaultInfo

Router.put('/api/update_employee-vault-info/:id', UpdateVaultInfo);
//get emp status info
Router.get('/api/employee-status-info/:id', GetEmpStatus);
Router.put('/api/update_employee-status-info/:id', UpdateStatusInfo);
//********************************************************* */
//                 Lead Management 
//********************************************************* */
//All lables
Router.get('/api/lables/:email', All_labels);
Router.get('/api/lables-member/:id', All_labelsForMember);
Router.get('/api/userpermission/:email', userPermission);
//total lead
Router.get('/api/leads', TotalLead);
//total unsigned lead
Router.get('/api/unsign-leads', UnaginedLead);
//highly interested
Router.get('/api/highly-interested', Highly_interested);
Router.get('/api/highly-interested-tabel/:id', highly_interested_table);
Router.get('/api/specific-team-member-tabel/:id/:id1', SpecificTeamMemberLeads);
Router.get('/api/header-label/:id', HeaderLabel);
Router.get('/api/all-customers/:user', AllCustomers);
Router.get('/api/get-highlyinterest-by-id/:id', GetLeadFromId);
Router.put('/api/update-assined-lead', ReassinedLead);

//geeting the specific customer
Router.get('/api/edit-customer/:id',EditLeadCustomer)
Router.put('/api/update-customer/:id',UpdateLeadCustomer) 
Router.post('/api/new-lead-customer',CreateLeadCustomer)
Router.get('/api/get-customer-by-id/:id', GetCustomerById);
//comments
Router.post('/api/comments/:id', CreateComments);
Router.get('/api/show-comments/:id', GetComments);
Router.put('/api/delete-comments/:id', DeleteComments);
Router.get('/api/label/:id', SelectForBox);
Router.put('/api/lead-label/:id',UpdateLabel)
Router.post('/api/close-lead/:id', ClosedLeadController);
Router.put('/api/lead-open/:id',ViewLead)
 
//Team And Zones
Router.get('/api/zones/:email', ZoneData);
Router.get('/api/teams/:email', TeamData);
Router.get('/api/zone-team/:id', ZoneTeamData);
Router.put('/api/zones-teams/:id',UpdateZoneTeam) 
Router.get('/api/teamates/:id', Getteamates);
Router.put('/api/update-employee-team/:id', UpdateTeamForEmployee);
Router.post('/api/add-to-new-team/:id',UpdateZoneTeam) 
Router.post('/api/create-zone-team/',CreateZoneTeam) 
//Project details 
Router.get('/api/project-data', projectData);
Router.post('/api/create-new-project', CreateNewProject);
Router.get('/api/get-project/:id', GetProjectDetails);
Router.put('/api/update-project/:id', UpdateProject);

//Supper admin
Router.get('/api/supper-admin/:email',getAllCompany)

//create a new user

Router.post('/api/create-new-user',CreateUser)

//get all users permission 
Router.get('/api/all-permission/:email', GetAllPermission);

//get all days for drop down
Router.get('/api/alldays/', AllDays);
//get all offices for drop down
Router.get('/api/drop-down-oficess/', AllOffices);
//get all contract for drop down
Router.get('/api/allcontract/', GetContracts);
//get Rs or per
Router.get('/api/rs-pr/', GetRupeOrPer);
//all labels
Router.get('/api/all-labels/', AllLabels);
//get country code
Router.get('/api/all-contrycode/', GetCountrycode);
//get all the members
Router.get('/api/all-members/', GetTeamMemeber);
//add team members
Router.put('/api/add-team-member/:id', AddTeamMember);
Router.get('/api/all-teams', GetzoneMemeber);
//select companies
Router.get('/api/select-company', GetCompanies);
Router.get('/api/single-company', GetSingleCompany);

//get all users_designations
Router.get('/api/alldesignation/', GetDessignation);
//get all departments
Router.get('/api/alldeprtment/', GetDepartment);
Router.get('/api/project-status/', GetStatus);
//get all user type
Router.get('/api/all-user-type/', GetUserType);
//get team for Employee 
Router.get('/api/emp-team/', TeamForEmployee);






module.exports = Router;