const mysql = require("mysql2");

const mysqlConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Basit0303#",
  database: "prosale",
  port: 3307,
  multipleStatements: true,
});

mysqlConnection.connect((err) => {
  if (!err) {
    console.log("Connected");
  } else {
    console.log("Connection Failed");
    console.log(err)
  }
});

module.exports = mysqlConnection;