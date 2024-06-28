const { body ,param } = require('express-validator');

module.exports = {
  createModifierGroupValidation: () => [
    body('name').isString().notEmpty(),
    body('modifiers').isArray().notEmpty(),
    body('modifiers.*').isString(),
    body('isSetPrice').isBoolean().optional(),
    body('servingSizes').isArray().optional(),
    body('servingSizes.*.sizeId').isString().optional(),
    body('servingSizes.*.price').isNumeric().optional(),
    body('store_id').isMongoId().notEmpty()
  ],
  updateModifierGroupDetailValidation: () => [
    body('name').isString().notEmpty(),
    body('modifiers').isArray().notEmpty(),
    body('modifiers.*').isString(),
    body('isSetPrice').isBoolean().optional(),
    body('servingSizes').isArray().optional(),
    body('servingSizes.*.sizeId').isString().optional(),
    body('servingSizes.*.price').isNumeric().optional(),
    body('isActive').isBoolean().notEmpty()
  ],
  getAllValidation:() =>[
    param('store_id').isMongoId().notEmpty()
  ],

};