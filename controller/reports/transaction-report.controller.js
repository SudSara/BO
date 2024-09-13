const express = require('express');
const transactionBLayer = require('../../businesslayer/reports/transaction-report.b-layer');
const router = express.Router();

router.get('/',(req, res, next) => {
    transactionBLayer.getTransactionReport(req,res)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

module.exports = router;