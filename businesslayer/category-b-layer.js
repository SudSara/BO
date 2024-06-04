const { CATEGORY } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    createCategory(category) {
        category.created_at = new Date();
        category.updated_at = new Date();
        return new Promise((resolve, reject) => {
            getdb(CATEGORY).insertOne(category, async (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, category });
            })
        })
    },

    getAllCategory(params) {
        let payload = {
            'account_id': params.account_id,
            'store_id': params.store_id
        }
        return new Promise((resolve, reject) => {
            getdb(CATEGORY).find(payload).toArray()
                .then((result) => {
                    resolve({ success: true, result });
                })
                .catch((err) => {
                    console.error("Error fetching all categories:", err);
                    reject(err);
                });
        });
    },

    updateCategory(req) {
        let { params, body } = req;
        body.updated_at = new Date();
        let queryPayload = {
            _id: ObjectId(params.category_id),
            account_id: body.account_id,
            store_id: body.store_id
        }
        return new Promise((resolve, reject) => {
            getdb(CATEGORY).updateOne(queryPayload, { $set: body }, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, body });
            });
        })
    },

    getCategoryById(data) {
        return new Promise((resolve, reject) => {
            let query = [
                {
                    '$match': {
                        '_id': ObjectId(data.params.id),
                        'account_id': data.query.account_id,
                        'store_id': data.query.store_id
                    }
                }
            ]
            getdb(CATEGORY).aggregate(query).toArray((err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result });
            });
        })
    },

    deleteCategoryById(req) {
        let { params, query } = req;
        return new Promise((resolve, reject) => {
            let queryPayload = {
                _id: ObjectId(params.category_id),
                account_id: query.account_id,
                store_id: query.store_id
            }
            getdb(CATEGORY).deleteOne(queryPayload, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result: `Deleted category successfully` });
            });
        });
    }

}