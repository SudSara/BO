const { body ,param } = require('express-validator');

module.exports = {
  createModifierGroupValidation: () => [
    body('name').isString().notEmpty(),
    body('modifiers').isArray().notEmpty(),
    body('modifiers.*').isString(),
    body('store_id').isMongoId().notEmpty()
  ],
  updateModifierGroupDetailValidation: () => [
    body('name').isString().notEmpty(),
    body('modifiers').isArray().notEmpty(),
    body('modifiers.*').isString(),
    body('isActive').isBoolean().optional(),
    body('store_id').isMongoId().notEmpty()
  ],
  getAllValidation:() =>[
    param('store_id').isMongoId().notEmpty()
  ],

};