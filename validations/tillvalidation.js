const { body, param } = require('express-validator');

module.exports = {
    createTillValidation: () => [
        body('emp_id').isString().optional(),
        body('amount').isFloat({ min: 0 }).optional(),
        body('openBalance').isFloat().optional(),
        body('closedBalance').isFloat().optional(),
        body('cashDrop').isFloat().optional(),
        body('cashDropLimit').isFloat().optional(),
        body('openBy').isString().optional(),
        body('closeBy').isString().optional(),
        body('paidIn').isFloat().optional(),
        body('paidOut').isFloat().optional(),
        body('startDate').isString().optional(),
        body('closedDate').isString().optional(),
        body('cashRefund').isFloat().optional(),
        body('tipPaid').isFloat().optional(),
        body('status').isString().optional(),
        body('store_id').isMongoId().notEmpty()
    ],
    updateTillDetailValidation: () => [
        body('emp_id').isString().optional(),
        body('amount').isFloat({ min: 0 }).optional(),
        body('openBalance').isFloat().optional(),
        body('closedBalance').isFloat().optional(),
        body('cashDrop').isFloat().optional(),
        body('cashDropLimit').isFloat().optional(),
        body('openBy').isString().optional(),
        body('closeBy').isString().optional(),
        body('paidIn').isFloat().optional(),
        body('paidOut').isFloat().optional(),
        body('startDate').isString().optional(),
        body('closedDate').isString().optional(),
        body('cashRefund').isFloat().optional(),
        body('tipPaid').isFloat().optional(),
        body('status').isString().optional(),
        body('store_id').isMongoId().notEmpty()
    ],
    getAllValidation: () => [
        param('id').isMongoId().notEmpty()
    ]
};
