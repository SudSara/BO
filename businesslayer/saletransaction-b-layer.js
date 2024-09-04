const { ONSALETRANS } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    createOnSaleTrans(onSale) {
        onSale.created_at = new Date();
        onSale.updated_at = new Date();
        onSale.store_id = ObjectId(onSale.store_id);
        return new Promise((resolve, reject) => {
            getdb(ONSALETRANS).insertOne(onSale, async (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:onSale });
            })
        })
    },

    getAllOnSaleTrans(onSalePayloadDetail) {
        let { params, body } = onSalePayloadDetail;
        let onSaleQueryPayload = {};
        if (params.store_id) {
            onSaleQueryPayload.store_id = ObjectId(params.store_id);
        }
        if (body.transactionType) {
            onSaleQueryPayload.transactionType = body.transactionType;
        }
        if ('onSale' in body) {
            onSaleQueryPayload.onSale = body.onSale;
        }
        console.log(onSaleQueryPayload)
        return new Promise((resolve, reject) => {
            getdb(ONSALETRANS).find(onSaleQueryPayload).toArray((err,result) => {
                    if(err){
                        reject(err)
                    }
                    resolve({success:true,result})
                })
        });
    },

    updateOnSaleTrans(onSaleRequest) {
        let { params, body } = onSaleRequest;
        body.updated_at = new Date();
        body.store_id = ObjectId(body.store_id);
        let queryPayload = {
            _id: ObjectId(params.onSaleTrans_id)
        }
        return new Promise((resolve, reject) => {
            getdb(ONSALETRANS).updateOne(queryPayload, { $set: body }, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:body });
            });
        })
    },

    getOnSaleTransById(data) {
        return new Promise((resolve, reject) => {
            let query = [
                {
                    '$match': {
                        '_id': ObjectId(data.params.id)
                    }
                }
            ]
            getdb(ONSALETRANS).aggregate(query).toArray((err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result });
            });
        })
    }

}