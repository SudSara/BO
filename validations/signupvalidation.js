const { body } = require('express-validator');

module.exports = {
  signupValidation: () => [
    body('business_type').isString().notEmpty(),
    body('stores_count').isNumeric().notEmpty(),
    body('credit_card').isBoolean().notEmpty(),
    body('store_name').isString().notEmpty(),
    body('first_name').isString().notEmpty(),
    body('last_name').isString().notEmpty(),
    body('email').isString().notEmpty(),
    body('country').isString().notEmpty(),
    body('state').isString().notEmpty()
  ],
};
