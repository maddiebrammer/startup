class ScoreNotifier {
  constructor() {
    const BACKEND_PORT = 4000; 
    const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';

    this.socket = new WebSocket(`${protocol}://${window.location.hostname}:${BACKEND_PORT}/ws`);
    this.handlers = [];

    this.socket.onopen = () => console.log("WS connected");
    this.socket.onerror = (e) => console.log("WS error", e);

    this.socket.onmessage = (msg) => {
        try {
            const event = JSON.parse(msg.data);
            this.handlers.forEach(handler => handler(event));
        } catch (err) {
            console.error('Failed to parse WS message', err);
        }
        };
  }

  addHandler(handler) {
    this.handlers.push(handler);
  }

  removeHandler(handler) {
    this.handlers = this.handlers.filter(h => h !== handler);
  }
}

export const scoreNotifier = new ScoreNotifier();
