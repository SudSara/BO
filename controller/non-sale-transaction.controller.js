const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const validation = require('../validations/non-sale-transaction.validation');
const nonCashTransBusinessLayer = require('../businesslayer/non-sale-transaction-b-layer');

router.post('/', validation.createTransactionValidation(), (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    nonCashTransBusinessLayer
        .createOnSaleTrans(req.body, res)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

router.get('/store/:store_id', (req, res, next) => {
     const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    nonCashTransBusinessLayer
        .getAllOnSaleTrans(req)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

router.put('/:onSaleTrans_id', validation.updateTransactionValidation(), (req, res, next) => {
    var query;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    if(Object.keys(req.body).length){
        query = nonCashTransBusinessLayer
        .updateOnSaleTrans(req)
    }/*else {
        query = nonCashTransBusinessLayer.deleteNonCashTranssById(req);
    }*/
    query.then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

router.get('/:id', validation.getTransactionValidation(),(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    nonCashTransBusinessLayer.getOnSaleTransById(req).then((data) => {
        res.send(data)
    })
        .catch((err) => {
            next(err);
        })
});

module.exports = router;