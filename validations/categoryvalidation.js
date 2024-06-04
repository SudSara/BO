const { body ,query,oneOf} = require('express-validator');

module.exports = {
  categoryValidation: () => [
    body('name').isString().notEmpty(),
    body('roles').isArray().notEmpty(),
    body('isExcludeCheckTax').isBoolean().notEmpty(),
    body('account_id').isString().notEmpty(),
    body('store_id').isString().notEmpty()
  ],
  updateValidation: () => [
    body('name').isString().notEmpty(),
    body('roles').isArray().notEmpty(),
    body('isExcludeCheckTax').isBoolean().notEmpty(),
    body('account_id').isString().notEmpty(),
    body('store_id').isString().notEmpty()
  ],
  getAllValidation:() =>[
    query('account_id').isString().notEmpty(),
    query('store_id').isString().notEmpty()
  ],
  updateOrdeleteValidation: () => [
    oneOf([
        ...module.exports.updateValidation(),
        ...module.exports.getAllValidation()
    ])
  ]
};