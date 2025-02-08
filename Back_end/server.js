const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const qbRoutes = require('./routes/qb');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }
});

app.set('io', io);

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000', // Update this to your client's origin
  methods: ['GET', 'PUT', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '20mb' }));
app.use(bodyParser.json());

const port = 4000;

app.use(qbRoutes);

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('register', (userId) => {
    socket.join(userId);
    console.log(`User with ID ${userId} registered for notifications`);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = { app, server, io };
