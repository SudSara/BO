const { param} = require('express-validator');

module.exports = {
  createLogsValidation: () => [
    param('store_id').isMongoId().notEmpty()
  ],
  getAllValidation:() =>[
    param('store_id').isMongoId().notEmpty()
  ]
};