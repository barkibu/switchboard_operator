const CryptoJS = require("crypto-js");

function isRequestSigned(req, key) {
  const credentials = requestCredentials(req);

  return credentials[1] == expectedSignature(req, key);
}

function requestCredentials(req) {
  return req.header('authorization').split(' ')[1].split(':');
}

function canonicalString(req) {
  return `${req.method},${req.header('content-type')},${req.header('x-authorization-content-sha256')},${req.url},${req.header('date')}`;
}

function expectedSignature(req, key) {
  return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(canonicalString(req), key));
}

exports.isRequestSigned = isRequestSigned;