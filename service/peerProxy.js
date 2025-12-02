const { WebSocketServer, WebSocket } = require('ws');

function peerProxy(httpServer, app) {
    const wss = new WebSocketServer({ noServer: true });

    app.set('wss', wss);

    httpServer.on('upgrade', (req, socket, head) => {
        if (req.url === '/ws') {
            wss.handleUpgrade(req, socket, head, (ws) => {
                wss.emit('connection', ws, req);
            });
        } else {
            socket.destroy();
        }
    });

    wss.on('connection', (ws) => {
        console.log("WS client connected");
        ws.isAlive = true;

        ws.on('message', (data) => {
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

    setInterval(() => {
        wss.clients.forEach((client) => {
            if (!client.isAlive) return client.terminate();
            client.isAlive = false;
            client.ping();
        });
    }, 10000);
}

module.exports = { peerProxy };
