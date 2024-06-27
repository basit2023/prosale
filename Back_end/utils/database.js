const mysql = require('mysql2');

const mysqlConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Basit0303#',
  database: 'prosale',
  port: 3307,
  multipleStatements: true,
});

mysqlConnection.connect((err) => {
  if (!err) {
    console.log('Connected to the database');
  } else {
    console.error('Database connection failed:', err);
  }
});

// Handle connection errors after initial connection
mysqlConnection.on('error', (err) => {
  console.error('MySQL connection error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Reconnecting to the database');
    handleDisconnect();
  } else {
    throw err;
  }
});

function handleDisconnect() {
  mysqlConnection.connect((err) => {
    if (!err) {
      console.log('Reconnected to the database');
    } else {
      console.error('Reconnection to the database failed:', err);
      setTimeout(handleDisconnect, 2000); // Retry connection after 2 seconds
    }
  });
}

module.exports = mysqlConnection;
