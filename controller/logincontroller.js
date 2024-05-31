const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const loginBLayer = require('../businesslayer/login-b-layer');
const validation = require('../validations/loginvalidation');

router.get('/', function(req, res){
  res.json({
    status:'success'
  })
});

router.post('/', validation.loginValidation(), (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  loginBLayer
    .generateToken(req.body, res)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/authendicate/v1', (req, res, next) => {
  loginBLayer
    .v1(req)
    .then((response) => {
      res.send(response);
    })
    .catch((err) => {
      next(err);
    });
});
router.post('/store/authendicate/v1', (req, res, next) => {
  loginBLayer
    .v2(req)
    .then((response) => {
      res.send(response);
    })
    .catch((err) => {
      next(err);
    });
});
module.exports = router;
