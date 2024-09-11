const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const validation = require('../validations/sale-recap-report.validation');
const saleReportBLayer = require('../businesslayer/sale-recap-report-b-layer');

// router.post('/', validation.createRolesValidation(), (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }
//     rolesBusinessLayer
//         .createRole(req.body, res)
//         .then((data) => {
//             res.send(data);
//         })
//         .catch((err) => {
//             next(err);
//         });
// });

router.get('/store/:store_id', validation.getSaleReport(), (req, res, next) => {
    const errors = validationResult(req);
   if (!errors.isEmpty()) {
       return res.status(400).json({ errors: errors.array() });
   }
   saleReportBLayer.generateSalesRecapReport(req) .then((data) => {
           res.send(data);
       })
       .catch((err) => {
           next(err);
       });
});


module.exports = router;