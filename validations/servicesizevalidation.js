const { body ,param } = require('express-validator');

module.exports = {
    createServingSizeValidation: () => [
    body('name').isString().notEmpty(),
    body('description').isString().optional(),
    body('store_id').isMongoId().notEmpty()
  ],
  updateServingSizeDetailValidation: () => [
    body('name').isString().notEmpty(),
    body('description').isString().optional(),
    body('isActive').isBoolean().optional(),
    body('store_id').isMongoId().notEmpty()
  ],
  getAllValidation:() =>[
    param('store_id').isMongoId().notEmpty()
  ],

};
