const { body ,query, param, oneOf} = require('express-validator');

module.exports = {
  createTaxValidation: () => [
    body('name').isString().notEmpty(),
    body('applyTo').isInt().optional(),
    body('taxType').isInt().optional(),
    body('isDefault').isBoolean().optional(),
    body('isQuantity').isBoolean().optional(),
    body('isInclusive').isBoolean().optional(),
    body('isApplyonSubtotal').isBoolean().optional(),
    body('percentage').isInt().optional(),
    body('store_id').isMongoId().notEmpty()
  ],
  updateTaxDetailValidation: () => [
    body('name').isString().notEmpty(),
    body('taxType').isInt().optional(),
    body('store_id').isMongoId().notEmpty()
  ],
  getAllValidation:() =>[
    param('store_id').isMongoId().notEmpty()
  ],
  updateOrdeleteValidation: () => [
    oneOf([
        ...module.exports.updateTaxDetailValidation(),
        ...module.exports.getAllValidation()
    ])
  ]
};

