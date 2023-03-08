// "POST,application/json,HT7pfmQzVqiA/DMPqomcEA==,/,Thu, 24 Sep 2020 16:01:14 GMT"
const signatureChecker = require("../../services/signature_checker");
const key = "kqhoPLrrF2MkF9cOz166UJrnAYpZRl5HblaTaUw54Fg4guk3RkxRqtAmrUmJ5fiNOx6Q07vxiX1/iJA7sT3xig==";
const request = {
  method: "POST",
  url: "/",
  header: (header) => {
    switch (header) {
      case "content-type":
        return "application/json";
      case "x-authorization-content-sha256":
        return "HT7pfmQzVqiA/DMPqomcEA==";
      case "date":
        return "Thu, 24 Sep 2020 16:01:14 GMT";
      case "authorization":
        return "APIAuth LOCAL_CONCIERGE_INSTANCE:u7W5NIxeim9LMkycsJMZxVAk5S0=";
    }
  },
};

test("signature is the expected one", () => {
  expect(signatureChecker.isRequestSigned(request, key)).toBeTruthy();
});
