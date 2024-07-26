const { body ,query,param,oneOf} = require('express-validator');

module.exports = {
    createCustomerValidation: () => [
    body('mail_id').isString().optional(),
    body('phone_number').isString().optional(),
    body('store_id').isMongoId().notEmpty()
  ],
  updateCustomersDetailValidation: () => [
    body('mail_id').isString().optional(),
    body('phone_number').isString().optional(),
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