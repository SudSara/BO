const { body, param } = require('express-validator');

module.exports = {
    createCloseDayValidation: () => [
        body('closeDayDate').isISO8601().optional(),
        body('closeDayTime').isISO8601().optional(),
        body('isAutoCloseDay').isBoolean().notEmpty(),
        body('store_id').isMongoId().notEmpty()
    ],
    updateCloseDayValidation: () => [
        body('closeDayDate').isISO8601().optional(),
        body('isAutoCloseDay').isBoolean().notEmpty(),
        body('closeDayTime').isISO8601().optional(),
    ],
    getAllValidation: () => [
        param('id').isMongoId().notEmpty()
      ],
};
