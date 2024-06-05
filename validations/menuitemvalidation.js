const { body ,query, oneOf} = require('express-validator');

module.exports = {
  createMenuitemValidation: () => [
    body('discount').isArray().notEmpty(),
    body('menu_name').isString().notEmpty(),
    body('tax').isArray().notEmpty(),
    body('category_id').isString().notEmpty(),
    body('item_showed_on').isString().notEmpty(),
    body('account_id').isString().notEmpty(),
    body('store_id').isString().notEmpty()
  ],
  updateMenuitemDetailValidation: () => [
    body('menu_name').isString().notEmpty(),
    body('account_id').isString().notEmpty(),
    body('store_id').isString().notEmpty()
  ],
  getAllValidation:() =>[
    query('account_id').isString().notEmpty(),
    query('store_id').isString().notEmpty()
  ],
  updateOrdeleteValidation: () => [
    oneOf([
        ...module.exports.updateMenuitemDetailValidation(),
        ...module.exports.getAllValidation()
    ])
  ]
};