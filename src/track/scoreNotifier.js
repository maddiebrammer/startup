class ScoreNotifier {
  constructor() {
    let port = window.location.port;
    const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';

    this.socket = new WebSocket(`${protocol}://${window.location.hostname}:${port}/ws`);
    this.handlers = [];

    this.socket.onmessage = async (msg) => {
      try {
        const event = JSON.parse(await msg.data.text());
        this.handlers.forEach(handler => handler(event));
      } catch {}
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
