const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const usage = {}; // { clientId: usageInMs }
const MAX_USAGE = 60000; // 60 seconds per user
const CAPTION_INTERVAL = 500; // 500ms delay between captions

// Simulated captions
const captions = [
    "Hello, how are you?",
    "This is a real-time captioning service.",
    "We are simulating speech-to-text conversion.",
    "Node.js and WebSockets are powerful for real-time applications.",
    "Each message is received as an audio packet."
];

// Function to generate a random caption
const generateCaption = () => captions[Math.floor(Math.random() * captions.length)];

// WebSocket for Real-time Captioning
wss.on("connection", (ws, req) => {
    const clientId = new URL(req.url, `http://localhost`).searchParams.get("clientId");
    
    if (!clientId) {
        ws.send(JSON.stringify({
            type: "error",
            message: "Missing 'clientId' in WebSocket query parameters.",
            disconnecting: true
        }));
        ws.close(1008, "Missing clientId");
        return;
    }

    usage[clientId] = usage[clientId] || 0;
    console.log(`Client connected: ${clientId}`);

    ws.on("message", (message) => {
        console.log(`Received audio packet from ${clientId}:`, message.toString());

        if (usage[clientId] >= MAX_USAGE) {
            ws.send(JSON.stringify({
                type: "limit_exceeded",
                message: "You have reached your 60-second captioning limit.",
                usage: usage[clientId],
                limit: MAX_USAGE,
                disconnecting: true
            }));
            ws.close(1000, "Captioning time limit exceeded");

            return;
        }

        // Each packet increases usage by 100ms
        usage[clientId] += 100;
        console.log(usage)
    });

    // Send captions periodically (every 500ms)
    const captionInterval = setInterval(() => {
        if (usage[clientId] >= MAX_USAGE) {
            ws.send(JSON.stringify({
                type: "limit_exceeded",
                message: "You have reached your 60-second captioning limit.",
                usage: usage[clientId],
                limit: MAX_USAGE,
                disconnecting: true
            }));
            clearInterval(captionInterval);
            ws.close(1000, "Captioning time limit exceeded");
            return;
        }

        // Send generated caption based on received packets
        ws.send(`Caption: ${generateCaption()} - ${new Date().toISOString()}`);
    }, CAPTION_INTERVAL);

    ws.on("close", () => {
        console.log(`Client ${clientId} disconnected.`);
        clearInterval(captionInterval);
    });
});

// REST API - Get Usage
app.get("/usage/:clientId", (req, res) => {
    const clientId = req.params.clientId;
    res.json({ clientId, usage: usage[clientId] || 0 });
});

// Start Server
const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
