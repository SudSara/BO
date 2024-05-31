const { body } = require('express-validator');

module.exports = {
  loginValidation: () => [
    body('user_name').isString().notEmpty(),
    body('password').isString().isLength({ min: 5 }),
  ],
};
