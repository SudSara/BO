const { body ,query, param,oneOf} = require('express-validator');

module.exports = {
  createMenuitemValidation: () => [
    body('discount').isArray().notEmpty(),
    body('name').isString().notEmpty(),
    body('tax').isArray().notEmpty(),
    body('category_id').isString().notEmpty(),
    body('item_showed_on').isString().notEmpty(),
    body('store_id').isMongoId().notEmpty()
  ],
  updateMenuitemDetailValidation: () => [
    body('name').isString().notEmpty(),
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