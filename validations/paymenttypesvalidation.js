const { body ,param } = require('express-validator');

module.exports = {
  createPaymentTypesValidation: () => [
    body('paymentTypeKey').isString().notEmpty(),
    body('paymentTypeName').isString().notEmpty(),
    body('store_id').isMongoId().notEmpty()
  ],
  updatePaymentTypesDetailValidation: () => [
    body('paymentTypeKey').isString().notEmpty(),
    body('isActive').isBoolean().notEmpty(),
    body('paymentTypeName').isString().notEmpty(),
    body('store_id').isMongoId().notEmpty()
  ],
  getAllValidation:() =>[
    param('store_id').isMongoId().notEmpty()
  ],

};
