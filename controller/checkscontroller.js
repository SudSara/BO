const express = require('express');
const router = express.Router();
const checksBusinessLayer = require('../businesslayer/checks-b-layers');

router.post('/',(req, res, next) => {
    checksBusinessLayer
    .createCheck(req.body, res)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/:id',(req,res,next)=>{
    checksBusinessLayer.getCheckById(req).then((data)=>{
    res.send(data)
  })
  .catch((err)=>{
    next(err);
  })
});

router.get('/filter/date',(req,res,next)=>{
    checksBusinessLayer.getCheckByDateRange(req.body).then((data)=>{
    res.send(data)
  })
  .catch((err)=>{
    next(err);
  })
});

router.get('/getbydate/active',(req,res,next)=>{
  checksBusinessLayer.getCheckByDateRangewithactive(req.body).then((data)=>{
    res.send(data)
  })
  .catch((err)=>{
    next(err);
  })
});

module.exports = router;
