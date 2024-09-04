const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const validation = require('../validations/noncashtransvalidation');
const nonCashTransBusinessLayer = require('../businesslayer/noncashtransaction-b-layer');

router.post('/', validation.createTransactionValidation(), (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    nonCashTransBusinessLayer
        .createNonCashTrans(req.body, res)
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
        .getAllNonCashTrans(req)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

router.put('/:nonCashTrans_id', validation.updateTransactionValidation(), (req, res, next) => {
    var query;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    if(Object.keys(req.body).length){
        query = nonCashTransBusinessLayer
        .updateNonCashTrans(req)
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
    nonCashTransBusinessLayer.getNonCashTransById(req).then((data) => {
        res.send(data)
    })
        .catch((err) => {
            next(err);
        })
});

module.exports = router;