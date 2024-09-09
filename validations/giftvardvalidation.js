const { body ,param } = require('express-validator');

module.exports = {
    createGiftCardValidation: () => [
    body('giftCardNumber').isString().notEmpty(),
    body('balanceAmount').isString().optional(),
    body('expiryDate').isString().optional(),
    body('store_id').isMongoId().notEmpty()
  ],
  updateGiftCardDetailValidation: () => [
    body('giftCardNumber').isString().notEmpty(),
    body('balanceAmount').isString().optional(),
    body('expiryDate').isString().optional(),
    body('store_id').isMongoId().notEmpty()
  ],
  getAllValidation:() =>[
    param('store_id').isMongoId().notEmpty()
  ],

};
