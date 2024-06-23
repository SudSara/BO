const { body ,query,oneOf} = require('express-validator');

module.exports = {
  categoryValidation: () => [
    body('name').isString().notEmpty(),
    body('applicablePeriod').isInt().notEmpty(),
    body('roles').isArray().notEmpty(),
    body('isExcludeCheckTax').isBoolean().notEmpty(),
    body('servingSizes').isArray().notEmpty(),
    body('coursing').isString().notEmpty(),
    body('foodType').isString().notEmpty(),
    body('color').isString().notEmpty(),
    body('taxes').isArray().notEmpty(),
    body('store_id').isMongoId().notEmpty()
  ],
  updateValidation: () => [
    body('name').isString().notEmpty(),
    body('applicablePeriod').isInt().notEmpty(),
    body('roles').isArray().notEmpty(),
    body('isExcludeCheckTax').isBoolean().notEmpty(),
    body('servingSizes').isArray().notEmpty(),
    body('coursing').isString().notEmpty(),
    body('foodType').isString().notEmpty(),
    body('color').isString().notEmpty(),
    body('taxes').isArray().notEmpty(),
    body('store_id').isMongoId().notEmpty()
  ],
  getAllValidation:() =>[
    query('store_id').isMongoId().notEmpty()
  ],
  updateOrdeleteValidation: () => [
    oneOf([
        ...module.exports.updateValidation(),
        ...module.exports.getAllValidation()
    ])
  ]
};