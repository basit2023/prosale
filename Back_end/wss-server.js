const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');


// ✅ Load your SSL certificate and private key
const server = https.createServer({
  key: fs.readFileSync('/etc/ssl/prosale/privkey.pem'),
  cert: fs.readFileSync('/etc/ssl/prosale/fullchain.pem'),
});

// ✅ Create the WebSocket server on top of the HTTPS server
const wss = new WebSocket.Server({ server });

// ✅ Handle incoming WebSocket connections
wss.on('connection', (ws) => {
  console.log('Client connected via secure WSS');
  ws.send('Secure WebSocket connection established');

  ws.on('message', (message) => {
    console.log('Received message:', message);
    // Handle incoming messages here
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// ✅ Start the HTTPS + WebSocket server on port 8443
server.listen(8443, () => {
  console.log('WSS server running at https://api.prosale.sale:8443');
});
