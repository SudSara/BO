const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const validation = require('../validations/menuitemvalidation');
const menuitemsBusinessLayer = require('../businesslayer/menuitem-b-layer');

router.post('/', validation.createMenuitemValidation(), (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    menuitemsBusinessLayer
        .createMenuitem(req.body, res)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

router.get('/', validation.getAllValidation(), (req, res, next) => {
     const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    menuitemsBusinessLayer
        .getAllMenuitems(req.query)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

router.put('/:menuitem_id', validation.updateOrdeleteValidation(), (req, res, next) => {
    var query;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    if(Object.keys(req.body).length){
        query = menuitemsBusinessLayer
        .updateMenuitems(req)
    }else {
        query = menuitemsBusinessLayer.deleteMenuitemsById(req);
    }
    query.then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

router.get('/:id', validation.getAllValidation(),(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    menuitemsBusinessLayer.getMenuitemsById(req).then((data) => {
        res.send(data)
    })
        .catch((err) => {
            next(err);
        })
});

module.exports = router;