const { WebSocketServer, WebSocket } = require('ws');

function peerProxy(httpServer) {
  const wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (ws) => {
    ws.isAlive = true;

    ws.on('message', (data) => {
      // Forward messages to all other connected clients
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });
    });

    ws.on('pong', () => {
      ws.isAlive = true;
    });
  });

  // Ping clients to ensure they are alive
  setInterval(() => {
    wss.clients.forEach((client) => {
      if (!client.isAlive) return client.terminate();
      client.isAlive = false;
      client.ping();
    });
  }, 10000);
}

module.exports = { peerProxy };
