const { USER_SECURE_DATA, ACCOUNTS, STORES } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = { 
    signup(data){
        return new Promise((resolve,reject)=>{
            data.created_at = new Date();
            data.updated_at = new Date();
            const password = data.password;
            delete data.password;
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
                let store_info = {
                    "name":data.store_name,
                    "primary":true,
                    "phone_number":"",
                    "email":data.email,
                    "address_line_1":"",
                    "address_line_2":"",
                    "city":"",
                    "state":"",
                    "zipcode":"",
                    "country":data.country,
                    "business_type":data.business_type,
                    "time_zone":"",
                    "languages":"",
                    "account_id":data._id,
                    "created_at":new Date(),
                    "updated_at":new Date()
                }
                await getdb(STORES).insertOne(store_info,async(err,result)=>{
                    if(err){
                        return reject(err);
                    }
                    let seInfo = {
                        store_id:store_info._id,
                        password:password,
                        created_at:new Date(),
                        updated_at:new Date()
                    }
                    await getdb(USER_SECURE_DATA).insertOne(seInfo);
                });
                return resolve(data);
            })
        })
    }
}