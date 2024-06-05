const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const validation = require('../validations/categoryvalidation');
const categoryBusinessLayer = require('../businesslayer/category-b-layer');

router.post('/', validation.categoryValidation(), (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    categoryBusinessLayer
        .createCategory(req.body, res)
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
    categoryBusinessLayer
        .getAllCategory(req.query)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

router.put('/:category_id', validation.updateOrdeleteValidation(), (req, res, next) => {
    var query;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    if(Object.keys(req.body).length){
        query = categoryBusinessLayer
        .updateCategory(req)
    }else {
        query = categoryBusinessLayer.deleteCategoryById(req);
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
    categoryBusinessLayer.getCategoryById(req).then((data) => {
        res.send(data)
    })
        .catch((err) => {
            next(err);
        })
});

router.get('/menu/:store_id',(req,res,next)=>{
    categoryBusinessLayer.getCateoryMenu(req).then((data)=>{
        res.send(data)
    })
    .catch((err)=>{
        next(err);
    })
})

module.exports = router;