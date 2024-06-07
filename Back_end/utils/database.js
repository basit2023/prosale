const mysql = require("mysql2");

const mysqlConnection = mysql.createConnection({
  host: "162.255.117.211",
  user: "profinance_prosale",
  password: ".dU8.&;{je,d",
  database: "profinance_prosale",
  port: 3306,
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
