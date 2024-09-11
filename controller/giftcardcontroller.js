const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const validation = require('../validations/giftvardvalidation');
const giftCardBusinessLayer = require('../businesslayer/giftcard-b-layer');

router.post('/', validation.createGiftCardValidation(), (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    giftCardBusinessLayer
        .createGiftCard(req.body, res)
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
    giftCardBusinessLayer
        .getAllGiftCards(req.params)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

router.get('/getGiftCardDetail',(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    giftCardBusinessLayer.getGiftCardsById(req).then((data) => {
        res.send(data)
    })
        .catch((err) => {
            next(err);
        })
});

module.exports = router;