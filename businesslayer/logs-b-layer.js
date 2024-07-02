const { LOGS } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    createLogs(logs) {
        logs.body.created_at = new Date();
        logs.body.updated_at = new Date();
        logs.body.store_id = ObjectId(logs.params.store_id);
        return new Promise((resolve, reject) => {
            getdb(LOGS).insertOne(logs.body, async (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:logs.body });
            })
        })
    },

    getAllLogs(params) {
        return new Promise((resolve, reject) => {
            getdb(LOGS).find({'store_id': ObjectId(params.store_id)}).toArray()
                .then((result) => {
                    resolve({ success: true, result });
                })
                .catch((err) => {
                    console.error("Error fetching all logs:", err);
                    reject(err);
                });
        });
    },

}