const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');

const server = https.createServer({
  key: fs.readFileSync('/etc/ssl/prosale/privkey.pem'),
  cert: fs.readFileSync('/etc/ssl/prosale/fullchain.pem'),
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected via WSS');
  ws.send('Connected to secure WebSocket');
});

server.listen(8443, () => {
  console.log('WSS server running at https://api.prosale.sale:8443');
});

// ✅ Export both the server (optional) and WebSocket server
module.exports = { wss, server };
