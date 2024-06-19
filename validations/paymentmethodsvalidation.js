const { body ,param } = require('express-validator');

module.exports = {
  createPaymentMethodValidation: () => [
    body('paymentMethod').isString().notEmpty(),
    body('isMultiCurrency').isBoolean(),
    body('openCashDrawer').isBoolean(),
    body('paymentPriority').isInt(),
    body('paymentType').isString().notEmpty(),
    body('isActive').isBoolean().notEmpty(),
    body('store_id').isMongoId().notEmpty()
  ],
  updatePaymentMethodDetailValidation: () => [
    body('paymentMethod').isString().notEmpty(),
    body('isMultiCurrency').isBoolean(),
    body('openCashDrawer').isBoolean(),
    body('paymentPriority').isInt(),
    body('paymentType').isString().notEmpty(),
    body('isActive').isBoolean().notEmpty(),
    body('store_id').isMongoId().notEmpty()
  ],
  getAllValidation:() =>[
    param('store_id').isMongoId().notEmpty()
  ],

};
