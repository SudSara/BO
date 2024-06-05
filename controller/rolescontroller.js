const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const validation = require('../validations/rolesvalidation');
const rolesBusinessLayer = require('../businesslayer/roles-b-layer');

router.post('/', validation.createRolesValidation(), (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    rolesBusinessLayer
        .createRole(req.body, res)
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
    rolesBusinessLayer
        .getAllRoles(req.query)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

router.put('/:role_id', validation.updateOrdeleteValidation(), (req, res, next) => {
    var query;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    if(Object.keys(req.body).length){
        query = rolesBusinessLayer
        .updateRoles(req)
    }else {
        query = rolesBusinessLayer.deleteRolesById(req);
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
    rolesBusinessLayer.getRolesById(req).then((data) => {
        res.send(data)
    })
        .catch((err) => {
            next(err);
        })
});

module.exports = router;