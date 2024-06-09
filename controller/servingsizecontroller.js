const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const validation = require('../validations/servicesizevalidation');
const servingSizeBusinessLayer = require('../businesslayer/servingsize-b-layer');

router.post('/', validation.createServingSizeValidation(), (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    servingSizeBusinessLayer
        .createServingSize(req.body, res)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

router.get('/:store_id', validation.getAllValidation(), (req, res, next) => {
     const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    servingSizeBusinessLayer
        .getAllServingSizes(req.params)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

router.put('/:servingsize_id', validation.updateServingSizeDetailValidation(), (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    servingSizeBusinessLayer
        .updateServingSizes(req).then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

router.get('/:servingsize_id/:store_id', validation.getAllValidation(),(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    servingSizeBusinessLayer.getServingSizesById(req).then((data) => {
        res.send(data)
    })
        .catch((err) => {
            next(err);
        })
});

module.exports = router;