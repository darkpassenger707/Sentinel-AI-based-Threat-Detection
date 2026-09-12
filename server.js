const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const TrafficLog = require('./models/TrafficLog');
const Threat = require('./models/Threat');
const BlockedIP = require('./models/BlockedIP');
const { analyzeUnidirectionalTraffic, calculateEntropy } = require('./utils/DetectionEngine');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

connectDB();

app.use('/api/traffic', require('./routes/trafficRoutes'));
app.use('/api/threats', require('./routes/threatRoutes'));
app.use('/api/blocked', require('./routes/BlockedRoutes'));
app.use(errorHandler);

// Simulated Unidirectional Traffic Generator & AI Pipeline Integration
const IPS = ['192.168.1.45', '10.0.4.12', '172.16.0.8', '45.33.22.11', '185.220.101.5'];
const PROTOCOLS = ['HTTP', 'HTTPS', 'TCP', 'UDP', 'DNS'];
const PAYLOADS = [
  "GET /api/v1/resource HTTP/1.1",
  "' OR '1'='1' --",
  "<script>alert(1)</script>",
  "SYN FLOOD PACKET DATA STREAM",
  "NORMAL_TCP_STREAM_PAYLOAD"
];

const ipOffenses = {};

async function processIncomingPacket() {
  const sourceIP = IPS[Math.floor(Math.random() * IPS.length)];
  const protocol = PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)];
  const payload = PAYLOADS[Math.floor(Math.random() * PAYLOADS.length)];
  
  const packetData = {
    sourceIP,
    destinationIP: '10.0.0.1',
    protocol,
    packetSize: Math.floor(Math.random() * 1400) + 64,
    requestRate: Math.floor(Math.random() * 450) + 1,
    interArrivalTime: Math.floor(Math.random() * 900) + 2,
    payloadEntropy: calculateEntropy(payload),
    payload
  };

  const analysis = analyzeUnidirectionalTraffic(packetData);
  const isMalicious = analysis.classification !== 'Normal';

  await TrafficLog.create({ ...packetData, isAnomaly: isMalicious });

  let threatRecord = null;
  if (isMalicious) {
    ipOffenses[sourceIP] = (ipOffenses[sourceIP] || 0) + 1;
    let autoBlocked = false;

    if (ipOffenses[sourceIP] >= parseInt(process.env.AUTO_BLOCK_THRESHOLD || 3)) {
      await BlockedIP.updateOne(
        { ip: sourceIP },
        { reason: analysis.classification, $inc: { offenseCount: 1 }, blockedAt: new Date() },
        { upsert: true }
      );
      autoBlocked = true;
    }

    threatRecord = await Threat.create({
      sourceIP,
      protocol,
      classification: analysis.classification,
      severity: analysis.severity,
      confidence: analysis.confidence,
      payloadSnippet: payload,
      isBlocked: autoBlocked
    });
  }

  io.emit('packet_processed', {
    packet: packetData,
    analysis,
    threat: threatRecord
  });
}

setInterval(processIncomingPacket, 1200);

io.on('connection', (socket) => {
  console.log(`[WebSocket] Client Connected: ${socket.id}`);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
});