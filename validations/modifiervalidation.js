const { body ,param } = require('express-validator');

module.exports = {
    createModifierValidation: () => [
    body('name').isString().notEmpty(),
    body('isIncludeDefaultTax').isBoolean().optional(),
    body('taxes').isArray().optional(),
    body('taxes.*').isString().optional(),
    body('PluCode').isString().optional(),
    body('modifyWithId').isString().optional(),
    body('color').isString().optional(),
    body('store_id').isMongoId().notEmpty()
  ],
  updateModifierDetailValidation: () => [
    body('name').isString().notEmpty(),
    body('isIncludeDefaultTax').isBoolean().optional(),
    body('taxes').isArray().optional(),
    body('taxes.*').isString().optional(),
    body('PluCode').isString().optional(),
    body('modifyWithId').isString().optional(),
    body('color').isString().optional(),
    body('isActive').isBoolean().notEmpty()
  ],
  getAllValidation:() =>[
    param('store_id').isMongoId().notEmpty()
  ],

};