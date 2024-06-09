const { body, param } = require('express-validator');

module.exports = {
  coursingValidation: () => [
    body('name').isString().notEmpty(),
    body('priority').isInt(),
    body('isActive').isBoolean().notEmpty(),
    body('store_id').isMongoId().notEmpty()
  ],
  updateCoursingDetailValidation: () => [
    body('name').isString().notEmpty(),
    body('priority').isInt(),
    body('isActive').isBoolean().notEmpty(),
    body('store_id').isMongoId().notEmpty()
  ],
  getAllValidation: () => [
    param('store_id').isMongoId().notEmpty()
  ],
};
