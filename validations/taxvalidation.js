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
    body('account_id').isString().notEmpty(),
    body('store_id').isString().notEmpty()
  ],
  updateTaxDetailValidation: () => [
    body('name').isString().notEmpty(),
    body('tax_type').isString().notEmpty(),
    body('account_id').isString().notEmpty(),
    body('store_id').isString().notEmpty()
  ],
  getAllValidation:() =>[
    query('account_id').isString().notEmpty(),
    query('store_id').isString().notEmpty()
  ],
  updateOrdeleteValidation: () => [
    oneOf([
        ...module.exports.updateTaxDetailValidation(),
        ...module.exports.getAllValidation()
    ])
  ]
};

