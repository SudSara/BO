const { body , oneOf, param} = require('express-validator');

module.exports = {
  createRolesValidation: () => [
    body('name').isString().notEmpty(),
    body('priority').isString().notEmpty(),
    body('role_id').isString().notEmpty(),
    body('permissions').isString().notEmpty(),
    body('store_id').isMongoId().notEmpty()
  ],
  updateRolesDetailValidation: () => [
    body('name').isString().notEmpty(),
    body('priority').isString().notEmpty(),
    body('role_id').isString().notEmpty(),
    body('permissions').isString().notEmpty(),
    body('store_id').isMongoId().notEmpty()
  ],
  getAllValidation:() =>[
    param('store_id').isMongoId().notEmpty()
  ],
  getroleIdValidation:() =>[
    param('role_id').isMongoId().notEmpty()
  ],
  updateOrdeleteValidation: () => [
    oneOf([
        ...module.exports.updateRolesDetailValidation(),
        ...module.exports.getAllValidation(),
        ...module.exports.getroleIdValidation()
    ])
  ]
};
