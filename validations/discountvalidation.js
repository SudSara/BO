const { body, oneOf, param} = require('express-validator');

module.exports = {
  createDiscountValidation: () => [
    body('name').isString().notEmpty(),
    body('applyTo').isInt().notEmpty(),
    body('level').isInt().optional(),
    body('categories').isArray().optional(),
    body('menus').optional(),
    body('isAutoDiscount').isBoolean().optional(),
    body('roles').isArray().optional(),
    body('attachCustomer').isBoolean().optional(),
    body('color').isString().optional(),
    body('discountRules').isArray().notEmpty(),
    body('store_id').isMongoId().notEmpty()
  ],
  updateDiscountDetailValidation: () => [
    body('name').isString().notEmpty(),
    body('applyTo').isInt().notEmpty(),
    body('level').isInt().optional(),
    body('categories').isArray().optional(),
    body('menus').optional(),
    body('isAutoDiscount').isBoolean().optional(),
    body('roles').isArray().optional(),
    body('attachCustomer').isBoolean().optional(),
    body('color').isString().optional(),
    body('discountRules').isArray().notEmpty(),
    body('isActive').isString().notEmpty(),

  ],
  getAllValidation:() =>[
    param('id').isMongoId().notEmpty()
  ]
};

