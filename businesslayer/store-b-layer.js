const { USER_SECURE_DATA, STORES } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = { 
    createstore(data){
        data.created_at = new Date();
        data.updated_at = new Date();
        data.account_id = ObjectId(data.account_id);
        const password = data.password;
        return new Promise((resolve,reject)=>{
            getdb(STORES).insertOne(data,async (err,result)=>{
                if(err){
                    return reject(err);
                }
                let seInfo = {
                    store_id:data._id,
                    password:password,
                    account_id : ObjectId(data.account_id),
                    created_at:new Date(),
                    updated_at:new Date()
                }
                await getdb(USER_SECURE_DATA).insertOne(seInfo)
                return resolve({success:true,data});
            })
        })
    },
    updatestore(req){
        let {params,body} = req;
        body.updated_at = new Date();
        return new Promise((resolve,reject)=>{
            getdb(STORES).updateOne({_id:ObjectId(params.store_id)},{$set:body},(err,result)=>{
                if(err){
                    return reject(err);
                }
                return resolve({success:true,body});
            });
        })
    },
    getStoreById(params){
        return new Promise((resolve,reject)=>{
            getdb(STORES).findOne({_id:ObjectId(params.id)},(err,result)=>{
                if(err){
                    return reject(err);
                }
                return resolve({success:true,result});
            });
        })
    },
    getStoreByAccountId(params){
        return new Promise((resolve,reject)=>{
            let query =[
                {
                  '$match': {
                    'account_id': ObjectId(params.account_id)
                  }
                }
              ]
            getdb(STORES).aggregate(query).toArray((err,result)=>{
                if(err){
                    return reject(err)
                }
                return resolve({success:true,result});
            })
        })
    },
    getSettingByStoreid(req){
        return new Promise((resolve,reject)=>{
            let query = [
                {
                  '$match': {
                    '_id': ObjectId(req.params.store_id)
                  }
                }, {
                  '$lookup': {
                    'from': 'category', 
                    'localField': '_id', 
                    'foreignField': 'store_id', 
                    'as': 'category'
                  }
                }, {
                  '$lookup': {
                    'from': 'taxes', 
                    'localField': '_id', 
                    'foreignField': 'store_id', 
                    'as': 'taxes'
                  }
                }, {
                  '$lookup': {
                    'from': 'discounts', 
                    'localField': '_id', 
                    'foreignField': 'store_id', 
                    'as': 'discounts'
                  }
                }, {
                  '$lookup': {
                    'from': 'roles', 
                    'localField': '_id', 
                    'foreignField': 'store_id', 
                    'as': 'roles'
                  }
                }, {
                  '$lookup': {
                    'from': 'menuitems', 
                    'localField': '_id', 
                    'foreignField': 'store_id', 
                    'as': 'menuitems'
                  }
                }, {
                  '$lookup': {
                    'from': 'users', 
                    'localField': '_id', 
                    'foreignField': 'store_id', 
                    'as': 'users'
                  }
                },{
                  '$lookup': {
                    'from': 'modifiers', 
                    'localField': '_id', 
                    'foreignField': 'store_id', 
                    'as': 'modifiers'
                  }
                },{
                  '$lookup': {
                    'from': 'modifierGroups', 
                    'localField': '_id', 
                    'foreignField': 'store_id', 
                    'as': 'modifierGroups'
                  }
                },
                {
                  '$lookup': {
                    'from': 'servingsize', 
                    'localField': '_id', 
                    'foreignField': 'store_id', 
                    'as': 'servingsize'
                  }
                },
                {
                  '$lookup': {
                    'from': 'coursing', 
                    'localField': '_id', 
                    'foreignField': 'store_id', 
                    'as': 'coursing'
                  }
                }
                
            ]
            getdb(STORES).aggregate(query).toArray((err,result)=>{
                if(err){
                    return reject(err)
                }
                return resolve({success:true,result})
            })
        })
    }
}