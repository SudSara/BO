const { NONCASHTRANS } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    createNonCashTrans(nonCashTrans) {
        nonCashTrans.created_at = new Date();
        nonCashTrans.updated_at = new Date();
        nonCashTrans.store_id = ObjectId(nonCashTrans.store_id);
        return new Promise((resolve, reject) => {
            getdb(NONCASHTRANS).insertOne(nonCashTrans, async (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:nonCashTrans });
            })
        })
    },

    getAllNonCashTrans(nonCashTransPayloadDetail) {
        let { params, body } = nonCashTransPayloadDetail;
        let nonCashTransQueryPayload = {};
        if (params.store_id) {
            nonCashTransQueryPayload.store_id = ObjectId(params.store_id);
        }
        if (body.emp_id) {
            nonCashTransQueryPayload.emp_id = body.emp_id;
        }
        return new Promise((resolve, reject) => {
            getdb(NONCASHTRANS).find(nonCashTransQueryPayload).toArray((err,result) => {
                    if(err){
                        reject(err)
                    }
                    resolve({success:true,result})
                })
        });
    },

    updateNonCashTrans(nonCashTransRequest) {
        let { params, body } = nonCashTransRequest;
        body.updated_at = new Date();
        body.store_id = ObjectId(body.store_id);
        let queryPayload = {
            _id: ObjectId(params.nonCashTrans_id)
        }
        return new Promise((resolve, reject) => {
            getdb(NONCASHTRANS).updateOne(queryPayload, { $set: body }, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:body });
            });
        })
    },

    getNonCashTransById(data) {
        return new Promise((resolve, reject) => {
            let query = [
                {
                    '$match': {
                        '_id': ObjectId(data.params.id)
                    }
                }
            ]
            getdb(NONCASHTRANS).aggregate(query).toArray((err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result });
            });
        })
    }

}