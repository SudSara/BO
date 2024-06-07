const { body ,query, oneOf} = require('express-validator');

module.exports = {
  createUserValidation: () => [
    body('language').isArray().notEmpty(),
    body('emp_id').isString().notEmpty(),
    body('roles').isArray().notEmpty(),
    body('mail_id').isString().notEmpty(),
    body('phone_number').isString().notEmpty(),
    body('new_password').isString().notEmpty(),
    body('confirm_password').isString().notEmpty(),
    body('pin').isString().notEmpty(),
    body('account_id').isMongoId().notEmpty()
  ],
  updateUserDetailValidation: () => [
    body('language').isArray().notEmpty(),
    body('emp_id').isString().notEmpty(),
    body('roles').isArray().notEmpty(),
    body('mail_id').isString().notEmpty(),
    body('phone_number').isString().notEmpty(),
    body('password').isString().notEmpty(),
    body('confirm_password').isString().notEmpty(),
    body('pin').isString().notEmpty(),
    body('account_id').isMongoId().notEmpty()
  ],
  getAllValidation:() =>[
    query('account_id').isMongoId().notEmpty()
  ],
  updateOrdeleteValidation: () => [
    oneOf([
        ...module.exports.updateUserDetailValidation(),
        ...module.exports.getAllValidation()
    ])
  ]
};