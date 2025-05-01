const { body , oneOf, param} = require('express-validator');

module.exports = {
  getSaleReport: () => [
    param('store_id').isMongoId().notEmpty()
  ]
};
