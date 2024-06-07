const { body ,query,oneOf} = require('express-validator');

module.exports = {
  categoryValidation: () => [
    body('name').isString().notEmpty(),
    body('roles').isArray().notEmpty(),
    body('isExcludeCheckTax').isBoolean().notEmpty(),
    body('account_id').isMongoId().notEmpty(),
    body('store_id').isMongoId().notEmpty()
  ],
  updateValidation: () => [
    body('name').isString().notEmpty(),
    body('roles').isArray().notEmpty(),
    body('isExcludeCheckTax').isBoolean().notEmpty(),
    body('account_id').isMongoId().notEmpty(),
    body('store_id').isMongoId().notEmpty()
  ],
  getAllValidation:() =>[
    query('account_id').isMongoId().notEmpty(),
    query('store_id').isMongoId().notEmpty()
  ],
  updateOrdeleteValidation: () => [
    oneOf([
        ...module.exports.updateValidation(),
        ...module.exports.getAllValidation()
    ])
  ]
};