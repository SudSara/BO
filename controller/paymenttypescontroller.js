const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const validation = require('../validations/paymenttypesvalidation');
const paymentTypesBusinessLayer = require('../businesslayer/paymenttypes-b-layer');

router.post('/', validation.createPaymentTypesValidation(), (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    paymentTypesBusinessLayer
        .createPaymentType(req.body, res)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

router.get('/store/:store_id', validation.getAllValidation(), (req, res, next) => {
     const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    paymentTypesBusinessLayer
        .getAllPaymentTypes(req.params)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

router.put('/:paymentType_id', validation.updatePaymentTypesDetailValidation(), (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    paymentTypesBusinessLayer
        .updatePaymentTypes(req).then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

router.get('/:id',(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    paymentTypesBusinessLayer.getPaymentTypesById(req).then((data) => {
        res.send(data)
    })
        .catch((err) => {
            next(err);
        })
});

module.exports = router;