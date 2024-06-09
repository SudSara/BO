const { DISCOUNTS } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    createDiscount(discount) {
        discount.created_at = new Date();
        discount.updated_at = new Date();
        discount.store_id = ObjectId(discount.store_id);
        return new Promise((resolve, reject) => {
            getdb(DISCOUNTS).insertOne(discount, async (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:discount });
            })
        })
    },

    getAllDiscounts(params) {
        let discountPayload = {
            'store_id': ObjectId(params.store_id)
        }
        return new Promise((resolve, reject) => {
            getdb(DISCOUNTS).find(discountPayload).toArray()
                .then((result) => {
                    resolve({ success: true, result });
                })
                .catch((err) => {
                    console.error("Error fetching all discounts:", err);
                    reject(err);
                });
        });
    },

    updateDiscounts(discountRequest) {
        let { params, body } = discountRequest;
        body.updated_at = new Date();
        body.store_id = ObjectId(body.store_id);
        let queryPayload = {
            _id: ObjectId(params.discount_id),
            store_id: body.store_id
        }
        return new Promise((resolve, reject) => {
            getdb(DISCOUNTS).updateOne(queryPayload, { $set: body }, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:body });
            });
        })
    },

    getDiscountsById(data) {
        return new Promise((resolve, reject) => {
            let query = [
                {
                    '$match': {
                        '_id': ObjectId(data.params.discount_id),
                        'store_id': ObjectId(data.params.store_id)
                    }
                }
            ]
            getdb(DISCOUNTS).aggregate(query).toArray((err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result });
            });
        })
    },
}