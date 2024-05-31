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
            })
        })
    }
}