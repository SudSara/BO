const { body ,query, oneOf} = require('express-validator');

module.exports = {
    createCustomerValidation: () => [
    body('mail_id').isString().notEmpty(),
    body('phone_number').isString().notEmpty(),
    body('account_id').isString().notEmpty(),
    body('store_id').isString().notEmpty()
  ],
  updateCustomersDetailValidation: () => [
    body('mail_id').isString().notEmpty(),
    body('phone_number').isString().notEmpty(),
    body('account_id').isString().notEmpty(),
    body('store_id').isString().notEmpty()
  ],
  getAllValidation:() =>[
    query('account_id').isString().notEmpty(),
    query('store_id').isString().notEmpty()
  ],
  updateOrdeleteValidation: () => [
    oneOf([
        ...module.exports.updateCustomersDetailValidation(),
        ...module.exports.getAllValidation()
    ])
  ]
};