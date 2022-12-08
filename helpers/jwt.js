var { expressjwt: jwt } = require("express-jwt");

function authJwt() {
  const secret = process.env.secret;
  const api = process.env.API_URL;
  return jwt({
    secret,
    algorithms: ["HS256"],
    //   isRevoked: isRevoked,
  }).unless({
    //excludes API for token verification.
    path: [
      `${api}/users/login`,
      `${api}/users/register`,
      { url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] }, // allow all request which start with api/v1/products and method is get or options
      { url: /\/public\/uploads(.*)/, methods: ["GET", "OPTIONS"] }, // allow all request which start with api/v1/products and method is get or options
    ],
  });
}

//checks weather user is admin or not before calling api
async function isRevoked(req, token) {
  console.log("isAdmin :" + token.payload.isAdmin);
  if (token.payload.isAdmin == false) {
    return true;
  }
  return false;
}

module.exports = authJwt;
