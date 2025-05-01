const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const validation = require('../validations/closedayvalidation');
const closeDayBusinessLayer = require('../businesslayer/closeday-b-layer');

router.post('/', validation.createCloseDayValidation(), (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    closeDayBusinessLayer
        .createCloseDay(req.body, res)
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
    closeDayBusinessLayer
        .getAllCloseDay(req)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

router.put('/:closeDay_id', validation.updateCloseDayValidation(), (req, res, next) => {
    var query;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    if(Object.keys(req.body).length){
        query = closeDayBusinessLayer
        .updateCloseDay(req)
    }/*else {
        query = closeDayBusinessLayer.deleteCloseDaysById(req);
    }*/
    query.then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

module.exports = router;