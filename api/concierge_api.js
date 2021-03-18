const axios = require("axios");
const CONCIERGE_URL = process.env.CONCIERGE_URL;

async function sendMessage(userId, message) {
  try {
    const params = JSON.parse(message);
    await axios.post(CONCIERGE_URL + "/incoming/postback", {
      Body: params["message"],
      From: userId,
      Payload: params["payload"],
    });
  } catch (e) {
    console.error(e);
  }
}

async function getVersion() {
  try {
    return (await axios.get(CONCIERGE_URL + "/version")).data;
  } catch (e) {
    console.error(e);
    return "😵 Unavailable 😵";
  }
}

exports.getVersion = getVersion;
exports.sendMessage = sendMessage;
