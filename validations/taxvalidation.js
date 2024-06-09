const { body ,query, oneOf} = require('express-validator');

module.exports = {
  createTaxValidation: () => [
    body('name').isString().notEmpty(),
    body('applyTo').isInt().notEmpty(),
    body('taxType').isInt().notEmpty(),
    body('isDefault').isBoolean().notEmpty(),
    body('isQuantity').isBoolean().notEmpty(),
    body('isInclusive').isBoolean().notEmpty(),
    body('isApplyonSubtotal').isBoolean().notEmpty(),
    body('percentage').isInt().notEmpty(),
    body('store_id').isMongoId().notEmpty()
  ],
  updateTaxDetailValidation: () => [
    body('name').isString().notEmpty(),
    body('taxType').isInt().notEmpty(),
    body('store_id').isMongoId().notEmpty()
  ],
  getAllValidation:() =>[
    query('store_id').isMongoId().notEmpty()
  ],
  updateOrdeleteValidation: () => [
    oneOf([
        ...module.exports.updateTaxDetailValidation(),
        ...module.exports.getAllValidation()
    ])
  ]
};

