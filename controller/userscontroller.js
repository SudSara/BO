const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const validation = require('../validations/usersvalidation');
const usersBusinessLayer = require('../businesslayer/users-b-layer');

router.post('/', validation.createUserValidation(), (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    usersBusinessLayer
        .createUser(req.body, res)
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
        .getAllUsers(req.params)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

router.put('/:user_id', validation.updateOrdeleteValidation(), (req, res, next) => {
    var query;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    if(Object.keys(req.body).length){
        query = usersBusinessLayer
        .updateUsers(req)
    }else {
       // query = usersBusinessLayer.deleteUsersById(req);
    }
    query.then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

router.get('/:id',(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    usersBusinessLayer.getUsersById(req).then((data) => {
        res.send(data)
    })
        .catch((err) => {
            next(err);
        })
});

router.post('/authendicate/v1', (req, res, next) => {
    usersBusinessLayer
      .v1(req)
      .then((response) => {
        res.send(response);
      })
      .catch((err) => {
        next(err);
    });
});

router.post('/logout/:device_id',(req,res,next)=>{
    usersBusinessLayer.logout(req).then((response)=>{
      res.send(response);
    }).catch(err=>{
      next(err);
    })
});
module.exports = router;