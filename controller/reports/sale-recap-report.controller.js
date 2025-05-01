const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const validation = require('../../validations/sale-recap-report.validation');
const saleReportBLayer = require('../../businesslayer/reports/sale-recap-report-b-layer');

router.post('/store/:store_id', validation.getSaleReport(), (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    saleReportBLayer.generateSalesRecapReport(req.body)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

module.exports = router;
