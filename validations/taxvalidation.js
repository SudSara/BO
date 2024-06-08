const { body ,query, oneOf} = require('express-validator');

module.exports = {
  createTaxValidation: () => [
    body('name').isString().notEmpty(),
    body('applyTo').isInt().notEmpty(),
    body('taxType').isInt().notEmpty(),
    body('isDefault').isBoolean().notEmpty(),
    body('isQuantity').isBoolean().notEmpty(),
    body('isInclusive').isBoolean().notEmpty(),
    body('IsApplyonSubtotal').isBoolean().notEmpty(),
    body('percentage').isInt().notEmpty(),
    body('account_id').isMongoId().notEmpty()
  ],
  updateTaxDetailValidation: () => [
    body('name').isString().notEmpty(),
    body('taxType').isInt().notEmpty(),
    body('account_id').isMongoId().notEmpty()
  ],
  getAllValidation:() =>[
    query('account_id').isMongoId().notEmpty()
  ],
  updateOrdeleteValidation: () => [
    oneOf([
        ...module.exports.updateTaxDetailValidation(),
        ...module.exports.getAllValidation()
    ])
  ]
};

