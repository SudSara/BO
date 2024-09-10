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

router.get('/store/:store_id',(req,res,next)=>{
  console.log("hai")
  checksBusinessLayer.getAllChecks(req).then((data)=>{
  res.send(data)
})
.catch((err)=>{
  next(err);
})
});

router.get('/getCheckByBusinessdate',(req,res,next)=>{
    checksBusinessLayer.getCheckByDateRange(req.body).then((data)=>{
    res.send(data)
  })
  .catch((err)=>{
    next(err);
  })
});

router.get('/getActiveByDate',(req,res,next)=>{
  checksBusinessLayer.getCheckByDateRangewithactive(req.body).then((data)=>{
    res.send(data)
  })
  .catch((err)=>{
    next(err);
  })
});

router.get('/:id',(req,res,next)=>{
  checksBusinessLayer.getCheckById(req).then((data)=>{
  res.send(data)
})
.catch((err)=>{
  next(err);
})
});

module.exports = router;
