const { body , oneOf, param} = require('express-validator');

module.exports = {
  createUserValidation: () => [
    body('first_name').isString().notEmpty(),
    body('last_name').isString().optional(),
    body('phone_number').isMobilePhone('any', { strictMode: false }),
    body('isPunchIn').isBoolean().notEmpty(),
    body('role').isString().notEmpty(),
    body('mail_id').isEmail().optional(),
    body('language').isArray().optional(),
    body('pin').isString().notEmpty(),
    body('image').isString().optional(),
    body('emp_id').isString().optional(),
  ],
  updateUserDetailValidation: () => [
    body('first_name').isString().notEmpty(),
    body('isPunchIn').isBoolean().notEmpty(),
    body('role').isString().notEmpty(),
    body('emailId').isEmail().optional(),
    body('pin').isString().notEmpty(),
    body('empId').isString().optional(),
    body('account_id').isMongoId().notEmpty()
  ],
  getAllValidation:() =>[
    param('store_id').isMongoId().notEmpty()
  ],
  updateOrdeleteValidation: () => [
    oneOf([
        ...module.exports.updateUserDetailValidation(),
        ...module.exports.getAllValidation()
    ])
  ]
};