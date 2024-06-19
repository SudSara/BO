const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const validation = require('../validations/paymentmethodsvalidation');
const paymentMethodsBusinessLayer = require('../businesslayer/payment-methods-b-layer');

router.post('/', validation.createPaymentMethodValidation(), (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    paymentMethodsBusinessLayer
        .createPaymentMethod(req.body, res)
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
    paymentMethodsBusinessLayer
        .getAllPaymentMethods(req.params)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

router.put('/:paymentMethod_id', validation.updatePaymentMethodDetailValidation(), (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    paymentMethodsBusinessLayer
        .updatePaymentMethods(req).then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

router.get('/:paymentMethod_id',(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    paymentMethodsBusinessLayer.getPaymentMethodsById(req).then((data) => {
        res.send(data)
    })
        .catch((err) => {
            next(err);
        })
});

module.exports = router;