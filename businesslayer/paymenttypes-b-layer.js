const { PAYMENTTYPES } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    createPaymentType(paymentType) {
        paymentType.created_at = new Date();
        paymentType.updated_at = new Date();
        paymentType.store_id = ObjectId(paymentType.store_id);
        paymentType.isActive = true;
        return new Promise((resolve, reject) => {
            getdb(PAYMENTTYPES).insertOne(paymentType, async (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:paymentType });
            })
        })
    },

    getAllPaymentTypes(params) {
        let paymentTypePayload = {
            'store_id': ObjectId(params.store_id)
        }
        return new Promise((resolve, reject) => {
            getdb(PAYMENTTYPES).find(paymentTypePayload).toArray()
                .then((result) => {
                    resolve({ success: true, result });
                })
                .catch((err) => {
                    console.error("Error fetching all paymentTypes:", err);
                    reject(err);
                });
        });
    },

    updatePaymentTypes(paymentTypeRequest) {
        let { params, body } = paymentTypeRequest;
        console.log(paymentTypeRequest)
        body.store_id = ObjectId(body.store_id);
        body.updated_at = new Date();
        let queryPayload = {
            _id: ObjectId(params.paymentType_id)
        }
        return new Promise((resolve, reject) => {
            getdb(PAYMENTTYPES).updateOne(queryPayload, { $set: body }, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:body });
            });
        })
    },

    getPaymentTypesById(data) {
        return new Promise((resolve, reject) => {
            let query = [
                {
                    '$match': {
                        '_id': ObjectId(data.params.id),
                    }
                }
            ]
            getdb(PAYMENTTYPES).aggregate(query).toArray((err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result });
            });
        })
    },

    deletePaymentTypesById(req) {
        let { params, query } = req;
        return new Promise((resolve, reject) => {
            let queryPayload = {
                _id: ObjectId(params.paymentType_id),
            }
            getdb(PAYMENTTYPES).deleteOne(queryPayload, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result: `Deleted paymentType successfully` });
            });
        });
    }

}