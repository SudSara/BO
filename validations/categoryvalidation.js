const { body ,query,oneOf} = require('express-validator');

module.exports = {
  categoryValidation: () => [
    body('name').isString().notEmpty(),
    body('applicablePeriod').isInt().notEmpty(),
    body('roles').isArray().notEmpty(),
    body('isExcludeCheckTax').isBoolean().notEmpty(),
    body('servingSizes').isArray().optional(),
    body('coursing').isString().notEmpty(),
    body('color').isString().optional(),
    body('taxes').isArray().optional(),
    body('store_id').isMongoId().notEmpty()
  ],
  updateValidation: () => [
    body('name').isString().notEmpty(),
    body('applicablePeriod').isInt().notEmpty(),
    body('roles').isArray().notEmpty(),
    body('isExcludeCheckTax').isBoolean().notEmpty(),
    body('servingSizes').isArray().optional(),
    body('coursing').isString().notEmpty(),
    body('color').isString().optional(),
    body('taxes').isArray().optional()
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