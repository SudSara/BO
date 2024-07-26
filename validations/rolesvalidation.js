const { body , oneOf, param} = require('express-validator');

module.exports = {
  createRolesValidation: () => [
    body('name').isString().notEmpty(),
    body('priority').isString().optional(),
    body('permissions').isString().optional(),
    body('store_id').isMongoId().notEmpty()
  ],
  updateRolesDetailValidation: () => [
    body('name').isString().notEmpty(),
    body('priority').isString().optional(),
    body('permissions').isString().optional(),
    param('store_id').isMongoId().notEmpty()
  ],
  getAllValidation:() =>[
    param('store_id').isMongoId().notEmpty()
  ],
  updateOrdeleteValidation: () => [
    oneOf([
        ...module.exports.updateRolesDetailValidation(),
        ...module.exports.getAllValidation()
    ])
  ]
};
