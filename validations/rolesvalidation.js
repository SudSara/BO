const { body ,query, oneOf} = require('express-validator');

module.exports = {
  createRolesValidation: () => [
    body('name').isString().notEmpty(),
    body('priority').isString().notEmpty(),
    body('role_id').isString().notEmpty(),
    body('roles').isArray().notEmpty(),
    body('store_id').isMongoId().notEmpty()
  ],
  updateRolesDetailValidation: () => [
    body('name').isString().notEmpty(),
    body('priority').isString().notEmpty(),
    body('role_id').isString().notEmpty(),
    body('roles').isArray().notEmpty(),
    body('store_id').isMongoId().notEmpty()
  ],
  getAllValidation:() =>[
    query('store_id').isMongoId().notEmpty()
  ],
  updateOrdeleteValidation: () => [
    oneOf([
        ...module.exports.updateRolesDetailValidation(),
        ...module.exports.getAllValidation()
    ])
  ]
};
