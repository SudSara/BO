const { TILLS } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    createTill(till) {
        till.created_at = new Date();
        till.updated_at = new Date();
        till.store_id = ObjectId(till.store_id);
        return new Promise((resolve, reject) => {
            getdb(TILLS).insertOne(till, async (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:till });
            })
        })
    },

    getAllTills(tillPayloadDetail) {
        let { params, body } = tillPayloadDetail;
        let tillQueryPayload = {};
        if (params.store_id) {
            tillQueryPayload.store_id = ObjectId(params.store_id);
        }
        if (body.emp_id) {
            tillQueryPayload.emp_id = body.emp_id;
        }
        if ('status' in body) {
            tillQueryPayload.status = body.status;
        }
        return new Promise((resolve, reject) => {
            getdb(TILLS).find(tillQueryPayload).toArray((err,result) => {
                    if(err){
                        reject(err)
                    }
                    resolve({success:true,result})
                })
        });
    },

    updateTills(tillRequest) {
        let { params, body } = tillRequest;
        body.updated_at = new Date();
        body.store_id = ObjectId(body.store_id);
        let queryPayload = {
            _id: ObjectId(params.till_id)
        }
        return new Promise((resolve, reject) => {
            getdb(TILLS).updateOne(queryPayload, { $set: body }, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:body });
            });
        })
    },

    getTillsById(data) {
        return new Promise((resolve, reject) => {
            let query = [
                {
                    '$match': {
                        '_id': ObjectId(data.params.id)
                    }
                }
            ]
            getdb(TILLS).aggregate(query).toArray((err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result });
            });
        })
    },

    getTillsForSaleRecap(tillPipeLine) {
        return new Promise((resolve, reject) => {
            getdb(TILLS).aggregate(tillPipeLine).toArray((err,result) => {
                    if(err){
                        reject(err)
                    }
                    resolve({success:true,result})
                })
        });
    }

}