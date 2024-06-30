const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const validation = require('../validations/logsvalidation');
const usersBusinessLayer = require('../businesslayer/logs-b-layer');

router.post('/store/:store_id', validation.createLogsValidation(), (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    usersBusinessLayer
        .createLogs(req, res)
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
    usersBusinessLayer
        .getAllLogs(req.params)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

module.exports = router;