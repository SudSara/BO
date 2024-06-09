const { body ,query, oneOf} = require('express-validator');

module.exports = {
  createUserValidation: () => [
    body('firstName').isString().notEmpty(),
    body('lastName').isString().notEmpty(),
    body('mobileNumber').isMobilePhone('any', { strictMode: false }),
    body('isPunchIn').isBoolean().notEmpty(),
    body('roles').isArray(),
    body('emailId').isEmail(),
    body('language').isArray(),
    body('pin').isString().notEmpty(),
    body('image').isString().optional(),
    body('empId').isString().notEmpty(),
    body('address.line1').isString().notEmpty(),
    body('address.line2').isString().optional(),
    body('address.city').isString().notEmpty(),
    body('address.state').isString().notEmpty(),
    body('address.zipCode').isString().notEmpty(),
    body('account_id').isMongoId().notEmpty()
  ],
  updateUserDetailValidation: () => [
    body('isPunchIn').isBoolean().notEmpty(),
    body('roles').isArray(),
    body('emailId').isEmail(),
    body('pin').isString().notEmpty(),
    body('empId').isString().notEmpty(),
    body('address.line1').isString().notEmpty(),
    body('address.line2').isString().optional(),
    body('address.city').isString().notEmpty(),
    body('address.state').isString().notEmpty(),
    body('address.zipCode').isString().notEmpty(),
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