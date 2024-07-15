const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const validation = require('../validations/storevalidation');
const storeBusinessLayer = require('../businesslayer/store-b-layer');

router.post('/', validation.storeValidation(), (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  storeBusinessLayer
    .createstore(req.body, res)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      next(err);
    });
});
router.put('/:store_id', validation.updateValidation(), (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    storeBusinessLayer
      .updatestore(req)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        next(err);
      });
});
router.get('/:id',(req,res,next)=>{
  storeBusinessLayer.getStoreById(req.params).then((data)=>{
    res.send(data)
  })
  .catch((err)=>{
    next(err);
  })
});
router.get('/account/:account_id',(req,res,next)=>{
  storeBusinessLayer.getStoreByAccountId(req.params).then((data)=>{
    res.send(data)
  })
  .catch((err)=>{
    next(err);
  })
});
router.get('/settings/:store_id',(req,res,next)=>{
  storeBusinessLayer.getSettingByStoreid(req).then((data)=>{
    res.send(data);
  })
  .catch((err)=>{
    next(err);
  })
});
router.get('/loggeddevice/:store_id',(req,res,next)=>{
  storeBusinessLayer.loggedDevice(req).then((data)=>{
    res.send(data);
  })
  .catch((err)=>{
    next(err);
  })
})
router.put('/loggout/:id',(req,res,next)=>{
  storeBusinessLayer.loggedOutDevice(req).then((data)=>{
    res.send(data);
  })
  .catch((err)=>{
    next(err);
  })
})

module.exports = router;
