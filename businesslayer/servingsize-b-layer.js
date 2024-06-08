const { SERVINGSIZE } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    createServingSize(servingsize) {
        servingsize.created_at = new Date();
        servingsize.updated_at = new Date();
        servingsize.account_id = ObjectId(servingsize.account_id);
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
            getdb(SERVINGSIZE).find({'account_id': ObjectId(params.account_id)}).toArray()
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
        body.account_id = ObjectId(body.account_id);
        let queryPayload = {
            _id: ObjectId(params.servingsize_id),
            account_id: body.account_id
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
                        'account_id': ObjectId(data.params.account_id)
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