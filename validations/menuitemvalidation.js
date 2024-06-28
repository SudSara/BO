const { body ,query, param,oneOf} = require('express-validator');

module.exports = {
  createMenuitemValidation: () => [
    body('applicablePeriod').isInt().notEmpty(),
    body('level').isString().notEmpty(),
    body('category_id').isString().notEmpty(),
    body('color').isString().optional(),
    body('cost_type').isString().optional(),
    body('description').isString().optional(),
    body('imageUrl').isString().optional(),
    body('measureType').isString().notEmpty(),
    body('name').isString().notEmpty(),
    body('prices').isArray(),
    body('prices.*').notEmpty(),
    body('secondary_name').isString().optional(),
    body('skuCode').isString().optional(),
    body('sub_category_id').isString().optional(),
    body('taxes').isArray().notEmpty(),
    body('store_id').isMongoId().notEmpty()
  ],
  updateMenuitemDetailValidation: () => [
    body('applicablePeriod').isInt().notEmpty(),
    body('level').isString().notEmpty(),
    body('category_id').isString().notEmpty(),
    body('color').isString().optional(),
    body('cost_type').isString().optional(),
    body('description').isString().optional(),
    body('imageUrl').isString().optional(),
    body('measureType').isString().notEmpty(),
    body('name').isString().notEmpty(),
    body('prices').isArray(),
    body('prices.*').isString(),
    body('secondary_name').isString().optional(),
    body('skuCode').isString().optional(),
    body('sub_category_id').isString().optional(),
    body('taxes').isArray().notEmpty()
  ],
  getAllValidation:() =>[
    param('store_id').isMongoId().notEmpty()
  ],
  updateOrdeleteValidation: () => [
    oneOf([
        ...module.exports.updateMenuitemDetailValidation(),
        ...module.exports.getAllValidation()
    ])
  ]
};
