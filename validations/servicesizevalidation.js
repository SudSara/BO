const { body ,param } = require('express-validator');

module.exports = {
    createServingSizeValidation: () => [
    body('name').isString().notEmpty(),
    body('description').isString().notEmpty(),
    body('isActive').isBoolean().notEmpty(),
    body('account_id').isMongoId().notEmpty()
  ],
  updateServingSizeDetailValidation: () => [
    body('name').isString().notEmpty(),
    body('description').isString().notEmpty(),
    body('isActive').isBoolean().notEmpty(),
    body('account_id').isMongoId().notEmpty()
  ],
  getAllValidation:() =>[
    param('account_id').isMongoId().notEmpty()
  ],

};
