const { USER_SECURE_DATA, ACCOUNTS } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = { 
    signup(data){
        data.created_at = new Date();
        data.updated_at = new Date();
        const password = data.password;
        console.log("dfsdfsd")
        delete data.password;
        return new Promise((resolve,reject)=>{
            getdb(ACCOUNTS).insertOne(data,(err,result)=>{
                if(err){
                    return reject(err);
                }
                let seInfo = {
                    account_id:data._id,
                    password:password,
                    created_at:new Date(),
                    updated_at:new Date()
                }
                getdb(USER_SECURE_DATA).insertOne(seInfo,(err,result)=>{ 

                })
                return resolve(data);
            })
        })
    }
}