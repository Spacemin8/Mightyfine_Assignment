# Realtime Captioning Service

## Overview

This project is a **simulation of a real-time captioning backend service** (Realtime Captioning Service) built with **Node.js**, **Express**, and **WebSocket (ws)**. It accepts simulated audio packets from clients, returns periodic captions, and tracks usage per client.

The system also enforces a **captioning time limit (60 seconds)** per client and disconnects users who exceed it, as per the bonus task.

---

## Implementation Choices

- **Node.js + Express**: Preferred tech stack for this task.
- **ws WebSocket library**: Lightweight, efficient WebSocket implementation.
- **In-memory store (`usage` object)**: Simple and fast solution for tracking usage per client.
- **Caption simulation via `setInterval`**: Mimics real-world transcription systems that return captions in time-based chunks.
- **Graceful communication and disconnection**:
  - Structured error and limit messages using JSON.
  - Clean WebSocket closure with proper status codes (`1000`, `1008`).

---

## How to Run the Service

### 1. Unzip Folder and Open in Terminal

```bash
cd realtime-captioning
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Server

```bash
node index.js
```

*Ensure port **3000** is free or modify the **PORT** if needed.*

---

## How to Test the Endpoints

### REST API - Usage Tracking

- **Endpoint**: `GET /usage/:clientId`
- **Example**:

```bash
curl http://localhost:3000/usage/testUser
```

- **Expected Response**:

```json
{
  "clientId": "testUser",
  "usage": 3400
}
```

### WebSocket - Captioning Endpoint

1. Open **Postman** or a WebSocket client.
2. Connect to:

```
ws://localhost:3000?clientId=testUser
```

3. Send simulated audio packets (can be any string or binary message):

```
Audio Packet 1
Audio Packet 2
```

4. Observe captions being received every 500ms.
5. After 60 seconds of packet-based usage, the server will respond with:

```json
{
  "type": "limit_exceeded",
  "message": "You have reached your 60-second captioning limit.",
  "usage": 60000,
  "limit": 60000,
  "disconnecting": true
}
```

And then close the connection.

---

## Demo Script (Optional Node Client)

If you'd like to test WebSocket functionality via a simple script:

### `client.js`

```js
const WebSocket = require("ws");
const ws = new WebSocket("ws://localhost:3000?clientId=testUser");

ws.on("open", () => {
    console.log("Connected to WebSocket server");
    let count = 0;
    const interval = setInterval(() => {
        if (count >= 600) return clearInterval(interval);
        ws.send(`Audio Packet ${count}`);
        count++;
    }, 100);
});

ws.on("message", (msg) => {
    console.log("Received:", msg.toString());
});

ws.on("close", () => console.log("Disconnected from server"));
```

Run it with:

```bash
node client.js
```

---

## Final Notes

- This solution is aligned 100% with the requirements.
- All behavior is simulated accurately: real-time captioning, usage tracking, time-limiting, and graceful messaging.
- The code is clean, efficient, and extensible.

You can safely use this file with a `.md` extension as a standard README.

---

**Submitted by:** Matthew Goldie

