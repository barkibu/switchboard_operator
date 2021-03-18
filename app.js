"use strict";

const express = require("express");
const http = require("http");
const url = require("url");
const uuid = require("uuid");
const WebSocket = require("ws");
const engine = require("express-dot-engine");

const signatureChecker = require("./services/signature_checker");
const conciergeApi = require("./api/concierge_api");
const petParentApi = require("./api/pet_parent_api");

const CONCIERGE_SECRET_KEY = process.env.CONCIERGE_POSTBACK_SECRET_KEY;
const SWITCHBOARD_PORT = process.env.SWITCHBOARD_PORT;

const map = new Map();

petParentApi.setupBrokerListener(map);

const app = express();
const path = require("path");

app.use(express.static("public"));
app.engine("dot", engine.__express);
app.set("views", path.join(__dirname, "./views"));
app.set("view engine", "dot");
app.use(express.json());

app.get("/", async function (req, res) {
  const version = await conciergeApi.getVersion();
  res.render("index", { conciergeVersion: version });
});

app.post("/", function (req, res) {
  if (signatureChecker.isRequestSigned(req, CONCIERGE_SECRET_KEY)) {
    petParentApi.publishMessageToBroker(JSON.stringify(req.body));
  } else {
    console.warn("Tried to push a message with invalid signature");
  }
  res.status(204).send();
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ clientTracking: false, noServer: true });

server.on("upgrade", function (request, socket, head) {
  wss.handleUpgrade(request, socket, head, function (ws) {
    wss.emit("connection", ws, request);
  });
});

wss.on("connection", function (ws, request) {
  const query = url.parse(request.url, true).query;
  const userId = query.session || uuid.v4();

  map.set(userId, ws);

  ws.on("message", async function (message) {
    conciergeApi.sendMessage(userId, message);
  });

  ws.on("close", function () {
    console.log("Pet Parent Disconnected !");
    map.delete(userId);
  });
});

server.listen(SWITCHBOARD_PORT, "0.0.0.0", function () {
  console.log(`Listening on http://0.0.0.0:${SWITCHBOARD_PORT}`);
});
