const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const validation = require('../validations/clockinoutvalidation');
const clockInOutBusinessLayer = require('../businesslayer/clockinout-b-layer')

router.post('/', validation.createClockInOutValidation(), (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    clockInOutBusinessLayer
        .createClockInOut(req.body, res)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

router.get('/getClockedInData', validation.getAllValidation(), (req, res, next) => {
     const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    clockInOutBusinessLayer
        .getAllClockInOuts(req.body)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

router.get('/getEmployeeClockInOuts', validation.getEmployeeDataValidation(), (req, res, next) => {
    const errors = validationResult(req);
   if (!errors.isEmpty()) {
       return res.status(400).json({ errors: errors.array() });
   }
   clockInOutBusinessLayer
       .getEmployeeClockInOuts(req.body)
       .then((data) => {
           res.send(data);
       })
       .catch((err) => {
           next(err);
       });
});

module.exports = router;