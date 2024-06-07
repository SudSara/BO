const { body ,query, oneOf} = require('express-validator');

module.exports = {
  createTaxValidation: () => [
    body('name').isString().notEmpty(),
    body('code').isString().notEmpty(),
    body('tax_type').isString().notEmpty(),
    body('tax_value').isString().notEmpty(),
    body('show_in_reports').isString().notEmpty(),
    body('apply_to').isString().notEmpty(),
    body('is_quantity').isBoolean().notEmpty(),
    body('is_inclusive').isBoolean().notEmpty(),
    body('is_default').isBoolean().notEmpty(),
    body('check_amount').isString().notEmpty(),
    body('tax_on_items').isArray().notEmpty(),
    body('tax_on_check_tax').isArray().notEmpty(),
    body('account_id').isMongoId().notEmpty(),
    body('store_id').isMongoId().notEmpty()
  ],
  updateTaxDetailValidation: () => [
    body('name').isString().notEmpty(),
    body('tax_type').isString().notEmpty(),
    body('account_id').isMongoId().notEmpty(),
    body('store_id').isMongoId().notEmpty()
  ],
  getAllValidation:() =>[
    query('account_id').isMongoId().notEmpty(),
    query('store_id').isMongoId().notEmpty()
  ],
  updateOrdeleteValidation: () => [
    oneOf([
        ...module.exports.updateTaxDetailValidation(),
        ...module.exports.getAllValidation()
    ])
  ]
};

