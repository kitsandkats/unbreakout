import * as A from './actions';

let _socketClient = null;

export function connectSocket(url, store){
  if (_socketClient) {
    try {
      _socketClient.close();
    } catch (e) {
      console.error(e);
    }
  }
  _socketClient = new SocketClient(url, store);
}

export class SocketClient {
  constructor(url, store) {
    this.url = url;
    this.store = store;
    this.connect();
  }

  connect() {
    console.log("SocketClient.connect");
    this.socket = new WebSocket(this.url);
    this.socket.onmessage = (e) => this.onMessage(e);
    this.socket.onopen = (e) => this.onOpen(e);
    this.socket.onclose = (e) => this.onClose(e);
    this.socket.onerror = (e) => this.onError(e);
    this.store.dispatch(A.connecting({url: this.url}));
  }

  close() {
    try {
      this.socket.close();
    } catch (e) {
      console.error(e);
    }
    if (this.heartbeat) {
      clearInterval(this.heartbeat);
      this.heartbeat = null;
    }
    this.store.dispatch(A.closing({url: this.url}));
  }

  onMessage(event) {
    console.log(`Received ws message ${event.data}`);
    let data;
    try {
      data = JSON.parse(event.data);
    } catch (e) {
      console.error("Transport.onMessage: invalid JSON", e);
      return;
    }

    this.store.dispatch(data);
    /*
    switch (data.type) {
      case "breakout_receive":
        this.store.dispatch(PLENARY_ACTIONS.breakoutReceive(data.payload));
        break;
      case "presence":
        this.store.dispatch(A.setPresence(data.payload));
        break;
      case "videosync":
        this.store.dispatch(VIDEOSYNC_ACTIONS.tick(data.payload));
        break;
      case "message_breakouts":
        this.store.dispatch(BREAKOUT_ACTIONS.message(data.payload));
        break;
      case "breakout":
        this.store.dispatch(BREAKOUT_ACTIONS.setBreakout(data.payload));
        break;
      case "breakout_presence":
        this.store.dispatch(PLENARY_ACTIONS.setBreakoutPresence(data.payload));
        break;
      case "error":
        let error = data.error ? data.error : data;
        alert(`Server error: ${error}`);
        console.error(error);
        break;
      default:
        console.log("transport.js: Unhandled message:", data);
        break;
    }
    */
  }

  onOpen(event) {
    console.log("SocketClient.onOpen");
    setTimeout(() => {
      this.heartbeat = setInterval(() => {
        this.sendMessage("heartbeat");
      }, 30000);
    }, Math.random() * 30000);
    this.store.dispatch(A.open({url: this.url}));
    if (this._connectInterval) {
      clearTimeout(this._connectInterval);
      this._connectInterval = null;
    }
  }

  onClose(event) {
    console.log("SocketClient.onClose");
    this.store.dispatch(A.closed({url: this.url}));
    if (!this._connectInterval) {
      this._connectInterval = setInterval(() => {
        if (this.store.getState().socket.state === WebSocket.CLOSED) {
          this.connect();
        }
      }, 1000);
    }
  }

  onError(event) {
    console.log("SocketClient.onError");
    this.store.dispatch(A.error({error: "error"}));
  }

  sendMessage(msg) {
    let string = JSON.stringify(msg);
    let waitForSend = (resolve) => {
      if (this.socket.bufferedAmount > 0) {
        setTimeout(() => waitForSend(resolve), 10);
      } else {
        resolve();
      }
    };
    return new Promise((resolve, reject) => {
      try {
        this.socket.send(string);
      } catch (e) {
        return reject(e);
      }
      waitForSend(resolve)
    });
  }
}

export function sendSocketMessage(message) {
  if (!(_socketClient && _socketClient.socket.readyState === WebSocket.OPEN)) {
    return Promise.reject(new Error("WebSocket not connected; can't send message."));
  }
  return _socketClient.sendMessage(message);
}
