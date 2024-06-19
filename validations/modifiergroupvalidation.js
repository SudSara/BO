const { body ,param } = require('express-validator');

module.exports = {
  createModifierGroupValidation: () => [
    body('name').isString().notEmpty(),
    body('modifiers').isArray().notEmpty(),
    body('modifiers.*').isString(),
    body('isSetPrice').isBoolean(),
    body('servingSizes').isArray().notEmpty(),
    body('servingSizes.*.sizeId').isString(),
    body('servingSizes.*.price').isNumeric(),
    body('isActive').isBoolean().notEmpty(),
    body('store_id').isMongoId().notEmpty()
  ],
  updateModifierGroupDetailValidation: () => [
    body('name').isString().notEmpty(),
    body('modifiers').isArray().notEmpty(),
    body('modifiers.*').isString(),
    body('isSetPrice').isBoolean(),
    body('servingSizes').isArray(),
    body('servingSizes.*.sizeId').isString(),
    body('servingSizes.*.price').isNumeric(),
    body('isActive').isBoolean().notEmpty()
  ],
  getAllValidation:() =>[
    param('store_id').isMongoId().notEmpty()
  ],

};
