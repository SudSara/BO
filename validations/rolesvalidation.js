const { body ,query, oneOf} = require('express-validator');

module.exports = {
  createRolesValidation: () => [
    body('name').isString().notEmpty(),
    body('priority').isString().notEmpty(),
    body('role_id').isString().notEmpty(),
    body('roles').isArray().notEmpty(),
    body('account_id').isString().notEmpty(),
    body('store_id').isString().notEmpty()
  ],
  updateRolesDetailValidation: () => [
    body('name').isString().notEmpty(),
    body('priority').isString().notEmpty(),
    body('role_id').isString().notEmpty(),
    body('roles').isArray().notEmpty(),
    body('account_id').isString().notEmpty(),
    body('store_id').isString().notEmpty()
  ],
  getAllValidation:() =>[
    query('account_id').isString().notEmpty(),
    query('store_id').isString().notEmpty()
  ],
  updateOrdeleteValidation: () => [
    oneOf([
        ...module.exports.updateRolesDetailValidation(),
        ...module.exports.getAllValidation()
    ])
  ]
};
