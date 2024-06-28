const { body ,query, oneOf, param} = require('express-validator');

module.exports = {
  createUserValidation: () => [
    body('first_name').isString().notEmpty(),
    body('last_name').isString().optional(),
    body('phone_number').isMobilePhone('any', { strictMode: false }),
    body('isPunchIn').isBoolean().notEmpty(),
    body('roles').isArray(),
    body('mail_id').isEmail(),
    body('language').isArray(),
    body('pin').isString().notEmpty(),
    body('image').isString().optional(),
    body('emp_id').isString().optional(),
    body('address.line1').isString().optional(),
    body('address.line2').isString().optional(),
    body('address.city').isString().optional(),
    body('address.state').isString().optional(),
    body('address.zipCode').isString().optional()
  ],
  updateUserDetailValidation: () => [
    body('isPunchIn').isBoolean().notEmpty(),
    body('roles').isArray(),
    body('emailId').isEmail(),
    body('pin').isString().notEmpty(),
    body('empId').isString().optional(),
    body('address.line1').isString().optional(),
    body('address.line2').isString().optional(),
    body('address.city').isString().optional(),
    body('address.state').isString().optional(),
    body('address.zipCode').isString().optional(),
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