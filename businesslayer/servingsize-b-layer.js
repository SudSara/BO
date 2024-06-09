const { SERVINGSIZE } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    createServingSize(servingsize) {
        servingsize.created_at = new Date();
        servingsize.updated_at = new Date();
        servingsize.store_id = ObjectId(servingsize.store_id);
        return new Promise((resolve, reject) => {
            getdb(SERVINGSIZE).insertOne(servingsize, async (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:servingsize });
            })
        })
    },

    getAllServingSizes(params) {
        return new Promise((resolve, reject) => {
            getdb(SERVINGSIZE).find({'store_id': ObjectId(params.store_id)}).toArray()
                .then((result) => {
                    resolve({ success: true, result });
                })
                .catch((err) => {
                    console.error("Error fetching all servingsizes:", err);
                    reject(err);
                });
        });
    },

    updateServingSizes(servingsizeRequest) {
        let { params, body } = servingsizeRequest;
        body.updated_at = new Date();
        body.store_id = ObjectId(body.store_id);
        let queryPayload = {
            _id: ObjectId(params.servingsize_id),
            store_id: body.store_id
        }
        return new Promise((resolve, reject) => {
            getdb(SERVINGSIZE).updateOne(queryPayload, { $set: body }, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:body });
            });
        })
    },

    getServingSizesById(data) {
        return new Promise((resolve, reject) => {
            let query = [
                {
                    '$match': {
                        '_id': ObjectId(data.params.servingsize_id),
                        'store_id': ObjectId(data.params.store_id)
                    }
                }
            ]
            getdb(SERVINGSIZE).aggregate(query).toArray((err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result });
            });
        })
    },

}