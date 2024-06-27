const { PAYMENTMETHODS } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    createPaymentMethod(paymentMethod) {
        paymentMethod.created_at = new Date();
        paymentMethod.updated_at = new Date();
        paymentMethod.store_id = ObjectId(paymentMethod.store_id);
        return new Promise((resolve, reject) => {
            getdb(PAYMENTMETHODS).insertOne(paymentMethod, async (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:paymentMethod });
            })
        })
    },

    getAllPaymentMethods(params) {
        return new Promise((resolve, reject) => {
            getdb(PAYMENTMETHODS).find({'store_id': ObjectId(params.store_id)}).toArray()
                .then((result) => {
                    resolve({ success: true, result });
                })
                .catch((err) => {
                    console.error("Error fetching all paymentMethods:", err);
                    reject(err);
                });
        });
    },

    updatePaymentMethods(paymentMethodRequest) {
        let { params, body } = paymentMethodRequest;
        body.updated_at = new Date();
        let queryPayload = {
            _id: ObjectId(params.paymentMethod_id)
        }
        return new Promise((resolve, reject) => {
            getdb(PAYMENTMETHODS).updateOne(queryPayload, { $set: body }, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:body });
            });
        })
    },

    getPaymentMethodsById(data) {
        return new Promise((resolve, reject) => {
            let query = [
                {
                    '$match': {
                        '_id': ObjectId(data.params.paymentMethod_id)
                    }
                }
            ]
            getdb(PAYMENTMETHODS).aggregate(query).toArray((err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result });
            });
        })
    },

}