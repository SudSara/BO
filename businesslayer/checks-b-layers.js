const { USER_SECURE_DATA, CHECKS } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = { 
    createCheck(data){
        data.created_at = new Date();
        data.updated_at = new Date();
        data.store_id = ObjectId(data.store_id);
        return new Promise((resolve,reject)=>{
            getdb(CHECKS).insertOne(data,async (err,result)=>{
                if(err){
                    return reject(err);
                }
                return resolve({success:true,data});
            })
        })
    },
    getCheckById(body){
        let start_date = new Date(body.start_date).setHours(0,0,0,0);
        let end_date = new Date(body.end_date).setHours(23,59,59,999);
       let query = [{ '$match':{
                    '$and': [
                        {
                            "created_at":{$gte:new Date(start_date)}
                        },
                        {
                            "created_at":{$lte:new Date(end_date)}
                        },
                    ]
                }
            }]
        return new Promise((resolve,reject)=>{
            getdb(CHECKS).aggregate(query).toArray((err,result)=>{
                if(err){
                    return reject(err);
                }
                return resolve({success:true,result});
            });
        })
    },
    getCheckDateRange(body){
        let start_date = new Date(body.start_date).setHours(0,0,0,0);
        let end_date = new Date(body.end_date).setHours(23,59,59,999);
       let query = [{ '$match':{
                    '$and': [
                        {
                            "created_at":{$gte:new Date(start_date)}
                        },
                        {
                            "created_at":{$lte:new Date(end_date)}
                        },
                    ]
                }
            }]
        return new Promise((resolve,reject)=>{
            getdb(CHECKS).aggregate(query).toArray((err,result)=>{
                if(err){
                    return reject(err);
                }
                return resolve({success:true,result});
            });
        })
    },
    
}