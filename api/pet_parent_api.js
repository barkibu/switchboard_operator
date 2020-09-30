

const redis = require("redis");

const REDIS_URL = process.env.REDISCLOUD_URL;
const DOWNSTREAM_CHANNEL = "bot-message";

var publisher;
var subscriber;

function getRedisClient() {
  return redis.createClient(REDIS_URL);
}
function getPublisher() {
  if (!publisher?.connected) {
    publisher = getRedisClient();
  }
  return publisher;
}

function logError(error) {
  console.error('Redis connection errored!', error);
}

function setupRedisDownstreamListener(map) {
  if (!subscriber?.connected) {
    subscriber = getRedisClient();
  }
  subscriber.on("message", sendMessageToClient(map));
  subscriber.on("error", logError);
  subscriber.subscribe(DOWNSTREAM_CHANNEL);
}

function publishMessageToBroker(params) {
  getPublisher().publish(DOWNSTREAM_CHANNEL, params);
}

function sendMessageToClient(map) {
  return function (_, message) {
    const parsedParams = JSON.parse(message);
    const dest = map.get(parsedParams["to"]);
    if (dest) {
      dest.send(message);
    }
  };
}

exports.setupBrokerListener = setupRedisDownstreamListener;
exports.publishMessageToBroker = publishMessageToBroker;
