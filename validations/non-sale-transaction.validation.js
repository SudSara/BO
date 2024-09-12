const { body, param } = require('express-validator');

module.exports = {
    createTransactionValidation: () => [
        body('amount').isFloat({ min: 0 }).optional(),
        body('emp_id').isString().optional(),
        body('transactionType').isString().notEmpty(),
        body('employee').isString().optional(),
        body('node').isString().optional(),
        body('reason').isString().optional(),
        body('startDate').isString().optional(),
        body('tillId').isString().optional(),
        body('transactionDate').isString().optional(),
        body('nonSale').isBoolean().notEmpty(),
        body('store_id').isMongoId().notEmpty()
    ],
    updateTransactionValidation: () => [
        body('amount').isFloat({ min: 0 }).optional(),
        body('emp_id').isString().optional(),
        body('transactionType').isString().notEmpty(),
        body('employee').isString().optional(),
        body('node').isString().optional(),
        body('reason').isString().optional(),
        body('startDate').isString().optional(),
        body('tillId').isString().optional(),
        body('transactionDate').isString().optional(),
        body('nonSale').isBoolean().notEmpty(),
        body('store_id').isMongoId().notEmpty()
    ],
    getTransactionValidation: () => [
        param('id').isMongoId().notEmpty()
    ]
};
