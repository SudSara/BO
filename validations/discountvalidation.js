const { body, oneOf, param} = require('express-validator');

module.exports = {
  createDiscountValidation: () => [
    body('name').isString(),
    body('level').isInt().notEmpty(),
    body('categories').isArray().notEmpty(),
    body('menus').isArray(),
    body('isAutoDiscount').isBoolean(),
    body('quantity').isInt().notEmpty(),
    body('applyType').isInt().notEmpty(),
    body('roles').isArray().notEmpty(),
    body('attachCustomer').isBoolean(),
    body('isActive').isBoolean().notEmpty(),
    body('image').isString(),
    body('color').isString(),
    body('store_id').isMongoId().notEmpty()
  ],
  updateDiscountDetailValidation: () => [
    body('name').isString(),
    body('level').isInt().notEmpty(),
    body('categories').isArray().notEmpty(),
    body('menus').isArray(),
    body('isAutoDiscount').isBoolean(),
    body('quantity').isInt().notEmpty(),
    body('applyType').isInt().notEmpty(),
    body('roles').isArray().notEmpty(),
    body('attachCustomer').isBoolean(),
    body('image').isString(),
    body('isActive').isBoolean().notEmpty(),
    body('color').isString()
  ],
  getAllValidation:() =>[
    param('id').isMongoId().notEmpty()
  ]
};

