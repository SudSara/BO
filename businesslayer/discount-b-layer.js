const { DISCOUNTS } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    createDiscount(discount) {
        discount.created_at = new Date();
        discount.updated_at = new Date();
        discount.account_id = ObjectId(discount.account_id);
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
            'account_id': ObjectId(params.account_id)
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
        body.account_id = ObjectId(body.account_id);
        let queryPayload = {
            _id: ObjectId(params.discount_id),
            account_id: body.account_id
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
        console.log(data.params)
        return new Promise((resolve, reject) => {
            let query = [
                {
                    '$match': {
                        '_id': ObjectId(data.params.discount_id),
                        'account_id': ObjectId(data.params.account_id)
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

    deleteDiscountsById(req) {
        let { params } = req;
        return new Promise((resolve, reject) => {
            let queryPayload = {
                _id: ObjectId(params.discount_id),
                account_id: ObjectId(params.account_id)
            }
            getdb(DISCOUNTS).deleteOne(queryPayload, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result: `Deleted discount successfully` });
            });
        });
    }

}