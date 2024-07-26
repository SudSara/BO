const { body ,query,oneOf} = require('express-validator');

module.exports = {
  categoryValidation: () => [
    body('name').isString().notEmpty(),
    body('applicablePeriod').isInt().optional(),
    body('roles').isArray().notEmpty(),
    body('isExcludeCheckTax').isBoolean().optional(),
    body('servingSizes').isArray().optional(),
    body('coursing').isString().notEmpty(),
    body('color').isString().optional(),
    body('taxes').isArray().notEmpty(),
    body('store_id').isMongoId().notEmpty()
  ],
  updateValidation: () => [
    body('name').isString().notEmpty(),
    body('applicablePeriod').isInt().optional(),
    body('roles').isArray().notEmpty(),
    body('isExcludeCheckTax').isBoolean().optional(),
    body('servingSizes').isArray().optional(),
    body('coursing').isString().notEmpty(),
    body('color').isString().optional(),
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