"use strict";

const session = require("express-session");
const express = require("express");
const http = require("http");
const uuid = require("uuid");
const WebSocket = require("ws");
const events = require("events");

const signatureChecker = require("./services/signature_checker");
const conciergeApi = require("./api/concierge_api");
const petParentApi = require("./api/pet_parent_api");

const BOT_MESSAGE_EVENT = "botMessage";
const PET_PARENT_MESSAGE_EVENT = "petParentMessage";

const CONCIERGE_SECRET_KEY = process.env.CONCIERGE_POSTBACK_SECRET_KEY;
const SWITCHBOARD_SECRET_KEY = process.env.SWITCHBOARD_SECRET_KEY;
const SWITCHBOARD_PORT = process.env.SWITCHBOARD_PORT;

const map = new Map();
const eventEmitter = new events.EventEmitter();

const sessionParser = session({
  saveUninitialized: false,
  secret: SWITCHBOARD_SECRET_KEY,
  resave: false,
});

petParentApi.setupBrokerListener(map);
eventEmitter.on(BOT_MESSAGE_EVENT, petParentApi.publishMessageToBroker);
eventEmitter.on(PET_PARENT_MESSAGE_EVENT, conciergeApi.sendMessage);

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(sessionParser);

app.get("/", function(req, res) {
  res.plain('Health Check 👨🏽‍⚕️').send();
});

app.post("/", function (req, res) {
  if (signatureChecker.isRequestSigned(req, CONCIERGE_SECRET_KEY)) {
    eventEmitter.emit(BOT_MESSAGE_EVENT, JSON.stringify(req.body));
  } else {
    console.warn("Tried to push a message with invalid signature");
  }
  res.status(204).send();
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ clientTracking: false, noServer: true });

server.on("upgrade", function (request, socket, head) {
  sessionParser(request, {}, () => {
    if (!request.session.userId) {
      // Should find a way to not create a new  session  if the websocket just failed for a  while :/
      const id = uuid.v4();
      request.session.userId = id;  
    }
    
    wss.handleUpgrade(request, socket, head, function (ws) {
      wss.emit("connection", ws, request);
    });
  });
});

wss.on("connection", function (ws, request) {
  const userId = request.session.userId;
  map.set(userId, ws);

  ws.on("message", async function (message) {
    eventEmitter.emit(PET_PARENT_MESSAGE_EVENT, userId, message);
  });

  ws.on("close", function () {
    console.log("Pet Parent Disconnected !");
    map.delete(userId);
  });
});

server.listen(SWITCHBOARD_PORT, "0.0.0.0", function () {
  console.log(`Listening on http://0.0.0.0:${SWITCHBOARD_PORT}`);
});
