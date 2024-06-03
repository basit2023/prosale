const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const qbRoutes = require("./routes/qb");
const cors = require('cors');
const app = express();
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'GET, PUT, POST, DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
// Use the CORS middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '20mb' }));
const port=4000;
app.use(bodyParser.json());

app.use(qbRoutes);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
