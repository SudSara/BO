const { body ,query, oneOf} = require('express-validator');

module.exports = {
    createCustomerValidation: () => [
    body('mail_id').isString().notEmpty(),
    body('phone_number').isString().notEmpty(),
    body('account_id').isMongoId().notEmpty(),
    body('store_id').isMongoId().notEmpty()
  ],
  updateCustomersDetailValidation: () => [
    body('mail_id').isString().notEmpty(),
    body('phone_number').isString().notEmpty(),
    body('account_id').isMongoId().notEmpty(),
    body('store_id').isMongoId().notEmpty()
  ],
  getAllValidation:() =>[
    query('account_id').isMongoId().notEmpty(),
    query('store_id').isMongoId().notEmpty()
  ],
  updateOrdeleteValidation: () => [
    oneOf([
        ...module.exports.updateCustomersDetailValidation(),
        ...module.exports.getAllValidation()
    ])
  ]
};