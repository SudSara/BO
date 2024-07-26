const { body } = require('express-validator');

module.exports = {
  storeValidation: () => [
    body('name').isString().notEmpty(),
    body('phone_number').isString().notEmpty(),
    body('email').isString().notEmpty(),
    body('address_line_1').isString().optional(),
    body('address_line_2').isString().optional(),
    body('city').isString().notEmpty(),
    body('state').isString().notEmpty(),
    body('zipcode').isString().notEmpty(),
    body('country').isString().notEmpty(),
    body('business_type').isString().notEmpty(),
    body('time_zone').isString().notEmpty(),
    body('languages').isString().notEmpty(),
    body('account_id').isMongoId().notEmpty()
  ],
  updateValidation: () => [
    body('name').isString().notEmpty(),
    body('phone_number').isString().notEmpty(),
    body('email').isString().notEmpty(),
    body('address_line_1').isString().optional(),
    body('address_line_2').isString().optional(),
    body('city').isString().notEmpty(),
    body('state').isString().notEmpty(),
    body('zipcode').isString().notEmpty(),
    body('country').isString().notEmpty(),
    body('business_type').isString().notEmpty(),
    body('time_zone').isString().notEmpty(),
    body('languages').isString().notEmpty()
  ],
};
