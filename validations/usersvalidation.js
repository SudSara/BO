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
    body('account_id').isString().notEmpty(),
    body('store_id').isString().notEmpty()
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
    body('account_id').isString().notEmpty(),
    body('store_id').isString().notEmpty()
  ],
  getAllValidation:() =>[
    query('account_id').isString().notEmpty(),
    query('store_id').isString().notEmpty()
  ],
  updateOrdeleteValidation: () => [
    oneOf([
        ...module.exports.updateUserDetailValidation(),
        ...module.exports.getAllValidation()
    ])
  ]
};