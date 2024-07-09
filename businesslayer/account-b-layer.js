const { LOGININFO } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {
    getAccountUsers(params) {
        return new Promise((resolve, reject) => {
            let query =[
                {
                    $match:{
                        account_id: ObjectId(params.account_id)
                    }
                },{
                    $project:{
                        token:0,
                        updated_at:0
                    }
                }
            ]
            getdb(LOGININFO).aggregate(query).toArray((err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result });
            })
        })
    }
}