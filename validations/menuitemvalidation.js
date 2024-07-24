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
    body('taxes').isArray().optional(),
    body('included').isArray().optional().custom((value, { req }) => {
      if (!Array.isArray(value)) {
        throw new Error('Included must be an array');
      }
      value.forEach((item, index) => {
        body(`included[${index}].id`).isString().notEmpty().run(req);
        body(`included[${index}].modifiers`).isArray().notEmpty().run(req);
        item.modifiers.forEach((modifier, modifierIndex) => {
          body(`included[${index}].modifiers[${modifierIndex}].id`).isString().optional();
          body(`included[${index}].modifiers[${modifierIndex}].name`).isString().optional();
          body(`included[${index}].modifiers[${modifierIndex}].price`).isNumeric().optional();
        });
      });
      return true;
    }),
    body('optional').isArray().optional().custom((value, { req }) => {
      if (!Array.isArray(value)) {
        throw new Error('Optional must be an array');
      }
      value.forEach((item, index) => {
        body(`optional[${index}].id`).isString().notEmpty().run(req);
        body(`optional[${index}].modifiers`).isArray().notEmpty().run(req);
        item.modifiers.forEach((modifier, modifierIndex) => {
          body(`optional[${index}].modifiers[${modifierIndex}].id`).isString().optional();
          body(`optional[${index}].modifiers[${modifierIndex}].name`).isString().optional();
          body(`optional[${index}].modifiers[${modifierIndex}].price`).isNumeric().optional();
        });
      });
      return true;
    }),
    body('mandatory').isArray().optional().custom((value, { req }) => {
      if (!Array.isArray(value)) {
        throw new Error('Mandatory must be an array');
      }
      value.forEach((item, index) => {
        body(`mandatory[${index}].id`).isString().notEmpty().run(req);
        body(`mandatory[${index}].minQty`).isInt().notEmpty().run(req);
        body(`mandatory[${index}].maxQty`).isInt().notEmpty().run(req);
        body(`mandatory[${index}].modifiers`).isArray().notEmpty().run(req);
        item.modifiers.forEach((modifier, modifierIndex) => {
          body(`mandatory[${index}].modifiers[${modifierIndex}].id`).isString().optional();
          body(`mandatory[${index}].modifiers[${modifierIndex}].name`).isString().optional();
          body(`mandatory[${index}].modifiers[${modifierIndex}].price`).isNumeric().optional();
        });
      });
      return true;
    })
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
    body('taxes').isArray().optional()
  ],
  getAllValidation:() =>[
    param('store_id').isMongoId().notEmpty()
  ],
  updateOrdeleteValidation: () => [
    oneOf([
        ...module.exports.updateMenuitemDetailValidation(),
        ...module.exports.getAllValidation(),
        body('included').isArray().optional(),
        body('optional').isArray().optional(),
        body('mandatory').isArray().optional()
    ])
  ]
};
