const { body ,param } = require('express-validator');

module.exports = {
    createModifierValidation: () => [
    body('name').isString().notEmpty(),
    body('isIncludeDefaultTax').isBoolean(),
    body('taxes').isArray(),
    body('taxes.*').isString(),
    body('PluCode').isString().optional(),
    body('modifyWithId').isString().optional(),
    body('color').isString().optional(),
    body('isActive').isBoolean().notEmpty(),
    body('account_id').isMongoId().notEmpty()
  ],
  updateModifierDetailValidation: () => [
    body('name').isString().notEmpty(),
    body('isIncludeDefaultTax').isBoolean(),
    body('taxes').isArray(),
    body('taxes.*').isString(),
    body('PluCode').isString().optional(),
    body('modifyWithId').isString().optional(),
    body('color').isString().optional(),
    body('isActive').isBoolean().notEmpty(),
    body('account_id').isMongoId().notEmpty()
  ],
  getAllValidation:() =>[
    param('account_id').isMongoId().notEmpty()
  ],

};
