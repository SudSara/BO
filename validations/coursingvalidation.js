const { body, param } = require('express-validator');

module.exports = {
  coursingValidation: () => [
    body('name').isString().notEmpty(),
    body('priority').isInt(),
    body('isActive').isBoolean().notEmpty(),
    body('account_id').isMongoId().notEmpty()
  ],
  updateCoursingDetailValidation: () => [
    body('name').isString().notEmpty(),
    body('priority').isInt(),
    body('isActive').isBoolean().notEmpty(),
    body('account_id').isMongoId().notEmpty()
  ],
  getAllValidation: () => [
    param('account_id').isMongoId().notEmpty()
  ],
};
