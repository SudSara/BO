const express = require('express');
const router = express.Router();
const saleReportsLayer = require('../businesslayer/salesreport-b-layer');

router.get('/sales',(req, res, next) => {
    saleReportsLayer
        .getSaleReport(req,res)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

router.get('/categorySales',(req, res, next) => {
    saleReportsLayer
        .getCategoryReport(req,res)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

module.exports = router;