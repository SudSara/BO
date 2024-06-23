const { USERS,USER_SECURE_DATA,ACCOUNTS ,STORES,LOGININFO} = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

module.exports = {

    createUser(user) {
        user.created_at = new Date();
        user.updated_at = new Date();
        password = user.new_password;
        pin = user.pin;
        delete user?.new_password;
        delete user?.confirm_password;
        delete user?.pin;
        user.store_id = ObjectId(user.store_id);
        return new Promise((resolve, reject) => {
            getdb(USERS).insertOne(user, async (err, result) => {
                if (err) {
                    return reject(err);
                }
                let seInfo = {
                    user_id:user._id,
                    password:password,
                    pin:pin,
                    store_id : ObjectId(user.store_id),
                    created_at:new Date(),
                    updated_at:new Date()
                }
               
                await getdb(USER_SECURE_DATA).insertOne(seInfo)
                return resolve({success:true,user});
            })
        })
    },

    getAllUsers(params) {
        let userPayload = {
           'store_id': ObjectId(params.store_id)
        }
        return new Promise((resolve, reject) => {
            getdb(USERS).find(userPayload).toArray()
                .then((result) => {
                    resolve({ success: true, result });
                })
                .catch((err) => {
                    console.error("Error fetching all users:", err);
                    reject(err);
                });
        });
    },

    updateUsers(userRequest) {
        let { params, body } = userRequest;
        body.updated_at = new Date();
        body.store_id = ObjectId(body.store_id);
        let queryPayload = {
            _id: ObjectId(params.user_id),
            store_id: ObjectId(body.store_id),
        }
        return new Promise((resolve, reject) => {
            getdb(USERS).updateOne(queryPayload, { $set: body }, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:body });
            });
        })
    },

    getUsersById(data) {
        return new Promise((resolve, reject) => {
            let query = [
                {
                    '$match': {
                        '_id': ObjectId(data.params.id)
                    }
                }
            ]
            getdb(USERS).aggregate(query).toArray((err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result });
            });
        })
    },

    deleteUsersById(req) {
        let { params, query } = req;
        return new Promise((resolve, reject) => {
            let queryPayload = {
                _id: ObjectId(params.user_id),
                store_id: ObjectId(query.store_id)
            }
            getdb(USERS).deleteOne(queryPayload, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result: `Deleted user successfully` });
            });
        });
    },

    v1(req) {
        return new Promise(async(resolve, reject) => {
            try{
            let response;
            const option = {
                user_name: req.body.user_name,
                password: req.body.password,
            };
            const query = [
                {
                $match: {
                    email: option.user_name,
                },
                },
                {
                $lookup: {
                    from: 'UserSecureData',
                    localField: '_id',
                    foreignField: 'store_id',
                    as: 'privatedata',
                },
                },
                {
                    $project: {
                        name: 1,
                        phone_number: 1,
                        account_id: 1,
                        email: 1,
                        password: { $arrayElemAt: [ '$privatedata.password', 0 ] },
                        user_secure_id:{ $arrayElemAt: [ '$privatedata._id', 0 ] },
                        primary:1,
                        phone_number:1,
                        business_type:1
                    },
                },
            ];
            getdb(STORES)
            .aggregate(query)
            .toArray(async(err, result) => {
                console.log(result,"fgdgf")
                if (err) {
                reject(err);
                }
                if (result.length == 1) {
                const user = result[0];
                const passwordMatch = user.password == option.password;
                const token_code = {
                    user_id: user._id,
                    store_id:user._id,
                    account_id:user.account_id
                };
                if (!passwordMatch) {
                    response = {
                    success: false,
                    message: 'Invalid credentials PW',
                    };
                    resolve(response);
                } else {
                    try{
                    let account_data = await getdb(ACCOUNTS).findOne({"_id":ObjectId(user.account_id)});
                    let u_s_data = await getdb(LOGININFO).find({account_id:ObjectId(user.account_id),"logged_in":true}).toArray();
                    if(!account_data?.stores_count){
                        return resolve({success:false,message:'invalid account'})
                    }
                    if(account_data?.stores_count <= u_s_data.length){
                        return resolve({success:false,message:'store login limit excited'})
                    }
                    const token_info = {
                        user: {
                        _id: user._id,
                        email: user.email,
                        },
                        token_code
                    };
                    const token = jwt.sign(
                        {
                        token_info,
                        },
                        'hG6j!68Mgd3r!',
                    );
                    await getdb(LOGININFO).updateOne({account_id:ObjectId(user.account_id),store_id:ObjectId(user._id),"device_id":req.body.device_id},{$set:{'device_name':req.body.device_name,'device_type':req.body.device_type,"logged_in":true,updated_at:new Date(),token:token}},{upsert:true});
                    resolve({
                        success: true,
                        token,
                        user: {
                        _id: user._id,
                        email: user.email,
                        primary:user.primary ? true:false,
                        phone_number:user.phone_number,
                        business_type:user.business_type
                        },
                    });
                    }catch(err){
                    reject(err);
                    }
                }
                } else {
                response = {
                    success: false,
                    message: 'Invalid credentials',
                };
                resolve(response);
                }
            });
            }catch(err){
            reject(err);
            }
        });
    },

    logout(req){
        return new Promise((resolve,reject)=>{
            getdb(LOGININFO).updateOne({store_id:ObjectId(req.auth.store_id),account_id:ObjectId(req.auth.account_id),device_id:req.params.device_id},{$set:{token:"",logged_in:false}},(err,result)=>{
              if(err){
                return reject(err)
              }
              resolve({success:true});
            })
        })
    }

}