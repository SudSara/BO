const jwt = require('jsonwebtoken');
// const mango = require('mongod');
const parseurl = require('url');
const config = require('../config/global-variables');

module.exports.checkAuth = (req, res, next) => {
  const method = req.method.toUpperCase();
  if (method == 'OPTIONS') {
    return next();
  }
  const requrl = parseurl.parse(req.url).pathname;
  const skipvalues = config.sfipfromauthendication;
  const errors = {};
  errors.authentication = 'Authentication';
  errors.mismatch = 'Authorization-mismatch';
  errors.expired = 'Authorization-expired';
  errors.header = 'Authorization-noheader';
  errors.authorization = 'Authorization';

  const tmp_url_arr = requrl.split('/');

  let testurl = tmp_url_arr[1];
  if (tmp_url_arr.length > 2) testurl = `${tmp_url_arr[1]}/${tmp_url_arr[2]}`;
  if (skipvalues.indexOf(`/${testurl}`) == -1) {
    let authentication =
      req.headers.Authorization || req.headers.authorization;
    if (authentication != undefined && authentication != "null") {
      const tokendata = authentication.split(' ');
      let token;
      if (tokendata.length == 2 && tokendata[0] == 'Bearer') {
        token = tokendata[1];
      } else if (tokendata.length == 1) {
        token = tokendata[0];
      } else {
        const err = new Error(errors.header);
        err.status = 401;
        return next(err);
      }
      jwt.verify(token, config.secret_salt, (error, data) => {
        if (error) {
          const err = new Error(errors.authentication);
          err.status = 401;
          return next(err);
        }
        req.auth = data.token_info.token_code;
        next();
      });
    } else {
      return res.status(401).send({error: errors.header});
    }
  } else {
    next();
  }
};
