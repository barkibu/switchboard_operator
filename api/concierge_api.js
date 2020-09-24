const axios = require("axios");
const CONCIERGE_URL = process.env.CONCIERGE_URL;

async function sendMessage(userId, message) {
  try {
    const params = JSON.parse(message);
    await axios.post(CONCIERGE_URL, {
      Body: params["message"],
      From: userId,
      Payload: params["payload"],
    });
  } catch (e) {
    console.error(e);
  }
}

exports.sendMessage = sendMessage;
