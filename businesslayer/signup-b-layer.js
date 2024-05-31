const { USER_SECURE_DATA, ACCOUNTS, STORES } = require('../helper/collection-name');
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
            getdb(ACCOUNTS).insertOne(data,async(err,result)=>{
                if(err){
                    return reject(err);
                }
                let seInfo = {
                    account_id:data._id,
                    password:password,
                    created_at:new Date(),
                    updated_at:new Date()
                }
                await getdb(USER_SECURE_DATA).insertOne(seInfo);
                //await getdb(STORES).insertOne()
                return resolve(data);
            })
        })
    }
}