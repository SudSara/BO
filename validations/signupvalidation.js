const { body } = require('express-validator');

module.exports = {
  signupValidation: () => [
    body('business_type').isString().optional(),
    body('stores_count').isNumeric().notEmpty(),
    body('credit_card').isBoolean().optional(),
    body('store_name').isString().optional(),
    body('first_name').isString().notEmpty(),
    body('last_name').isString().optional(),
    body('email').isString().notEmpty(),
    body('country').isString().optional(),
    body('state').isString().optional()
  ],
};
