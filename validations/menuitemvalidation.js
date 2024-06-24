const { body ,query, param,oneOf} = require('express-validator');

module.exports = {
  createMenuitemValidation: () => [
    body('applicablePeriod').isInt().notEmpty(),
    body('level').isString().notEmpty(),
    body('category_id').isString().notEmpty(),
    body('color').isString().notEmpty(),
    body('cost_type').isString().notEmpty(),
    body('description').isString().notEmpty(),
    body('imageUrl').isString().notEmpty(),
    body('measureType').isString().notEmpty(),
    body('name').isString().notEmpty(),
    body('prices').isArray(),
    body('prices.*').notEmpty(),
    body('secondary_name').isString().notEmpty(),
    body('skuCode').isString().notEmpty(),
    body('sub_category_id').isString().notEmpty(),
    body('taxes').isArray().notEmpty(),
    body('store_id').isMongoId().notEmpty()
  ],
  updateMenuitemDetailValidation: () => [
    body('applicablePeriod').isInt().notEmpty(),
    body('level').isString().notEmpty(),
    body('category_id').isString().notEmpty(),
    body('color').isString().notEmpty(),
    body('cost_type').isString().notEmpty(),
    body('description').isString().notEmpty(),
    body('imageUrl').isString().notEmpty(),
    body('measureType').isString().notEmpty(),
    body('name').isString().notEmpty(),
    body('prices').isArray(),
    body('prices.*').isString(),
    body('secondary_name').isString().notEmpty(),
    body('skuCode').isString().notEmpty(),
    body('sub_category_id').isString().notEmpty(),
    body('taxes').isArray().notEmpty(),
    body('store_id').isMongoId().notEmpty()
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
