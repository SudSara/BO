const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const validation = require('../validations/signupvalidation');
const sigupBusiness = require('../businesslayer/signup-b-layer');

router.post('/', validation.signupValidation(), (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  sigupBusiness
    .signup(req.body, res)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      next(err);
    });
});
module.exports = router;
