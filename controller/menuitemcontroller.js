const express = require('express');
const router = express.Router();
const multer = require('multer');
const { validationResult } = require('express-validator');
const validation = require('../validations/menuitemvalidation');
const menuitemsBusinessLayer = require('../businesslayer/menuitem-b-layer');
const path = require('path');

// Multer middleware setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let newPath = __dirname.replace('/controller', '/');
        cb(null, path.join(newPath, 'bulk-upload/')); // Upload files to the 'bulk-upload' directory
    },
    filename: function (req, file, cb) {
        // Dynamic filename based on original filename
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage: storage });

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

router.get('/store/:store_id', validation.getAllValidation(), (req, res, next) => {
     const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    menuitemsBusinessLayer
        .getAllMenuitems(req.params)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

router.put('/:menuitem_id', (req, res, next) => {
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

router.get('/:id',(req, res, next) => {
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

router.post('/bulkUpload', upload.single('menuitem-bulk-upload'), async (req, res, next) => {
    let newPath = __dirname.replace('/controller', '/');
    const filePath = path.join(newPath, 'bulk-upload', req.file.filename); // Constructing the file path
    try {
        const result = await menuitemsBusinessLayer.readExcelAndUpdateDB(filePath);
        res.send(result);
    } catch (err) {
        next(err);
    }
});

module.exports = router;