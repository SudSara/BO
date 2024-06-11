const { body ,query,param,oneOf} = require('express-validator');

module.exports = {
    createCustomerValidation: () => [
    body('mail_id').isString().notEmpty(),
    body('phone_number').isString().notEmpty(),
    body('store_id').isMongoId().notEmpty()
  ],
  updateCustomersDetailValidation: () => [
    body('mail_id').isString().notEmpty(),
    body('phone_number').isString().notEmpty(),
    body('store_id').isMongoId().notEmpty()
  ],
  getAllValidation:() =>[
    param('id').isMongoId().notEmpty()
  ],
  updateOrdeleteValidation: () => [
    oneOf([
        ...module.exports.updateCustomersDetailValidation(),
        ...module.exports.getAllValidation()
    ])
  ]
};