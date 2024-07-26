const { body, param } = require('express-validator');

module.exports = {
  coursingValidation: () => [
    body('name').isString().notEmpty(),
    body('priority').isInt().optional(),
    body('isActive').isBoolean().optional(),
    body('store_id').isMongoId().notEmpty()
  ],
  updateCoursingDetailValidation: () => [
    body('name').isString().notEmpty(),
    body('priority').isInt().optional(),
    body('isActive').isBoolean().optional(),
    body('store_id').isMongoId().notEmpty()
  ],
  getAllValidation: () => [
    param('store_id').isMongoId().notEmpty()
  ],
};
