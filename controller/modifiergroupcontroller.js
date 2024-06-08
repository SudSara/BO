const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const validation = require('../validations/modifiergroupvalidation');
const modifierGroupBusinessLayer = require('../businesslayer/modifiergroup-b-layer');

router.post('/', validation.createModifierGroupValidation(), (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    modifierGroupBusinessLayer
        .createModifierGroup(req.body, res)
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
    modifierGroupBusinessLayer
        .getAllModifierGroups(req.params)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

router.put('/:modifierGroup_id', validation.updateModifierGroupDetailValidation(), (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    modifierGroupBusinessLayer
        .updateModifierGroups(req).then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

router.get('/:modifierGroup_id/:account_id', validation.getAllValidation(),(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    modifierGroupBusinessLayer.getModifierGroupsById(req).then((data) => {
        res.send(data)
    })
        .catch((err) => {
            next(err);
        })
});

module.exports = router;