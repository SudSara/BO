const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const validation = require('../validations/modifiervalidation');
const modifierBusinessLayer = require('../businesslayer/modifier-b-layer');

router.post('/', validation.createModifierValidation(), (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    modifierBusinessLayer
        .createModifier(req.body, res)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

router.get('/:account_id', validation.getAllValidation(), (req, res, next) => {
     const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    modifierBusinessLayer
        .getAllModifiers(req.params)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

router.put('/:modifier_id', validation.updateModifierDetailValidation(), (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    modifierBusinessLayer
        .updateModifiers(req).then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

router.get('/:modifier_id/:account_id', validation.getAllValidation(),(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    modifierBusinessLayer.getModifiersById(req).then((data) => {
        res.send(data)
    })
        .catch((err) => {
            next(err);
        })
});

module.exports = router;