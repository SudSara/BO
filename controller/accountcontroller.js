const express = require('express');
const router = express.Router();
const accountBusinessLayer = require('../businesslayer/account-b-layer');

router.get('/:account_id',(req, res, next) => {
    accountBusinessLayer
        .getAccountUsers(req.params, res)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

module.exports = router;