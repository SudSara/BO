const { body ,param } = require('express-validator');

module.exports = {
  createClockInOutValidation: () => [
    body('employeeId').isString().notEmpty(),
    body('businessDate').isString().notEmpty(),
    body('dateWithTime').isString().notEmpty(),
    body('store_id').isMongoId().notEmpty()
  ],
  getAllValidation:() =>[
    body('store_id').isMongoId().notEmpty(),
    body('businessDate').isString().notEmpty(),
  ],
  getEmployeeDataValidation:()=>[
    body('businessDate').isString().notEmpty(),
    body('store_id').isMongoId().notEmpty(),
    body('businessDate').isString().notEmpty(),
  ]
};
