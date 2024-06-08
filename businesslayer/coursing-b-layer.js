const { COURSING } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    createCoursing(coursing) {
        coursing.created_at = new Date();
        coursing.updated_at = new Date();
        coursing.account_id = ObjectId(coursing.account_id);
        return new Promise((resolve, reject) => {
            getdb(COURSING).insertOne(coursing, async (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:coursing });
            })
        })
    },

    getAllCoursing(params) {
        return new Promise((resolve, reject) => {
            getdb(COURSING).find({'account_id': ObjectId(params.account_id)}).toArray()
                .then((result) => {
                    resolve({ success: true, result });
                })
                .catch((err) => {
                    console.error("Error fetching all coursing:", err);
                    reject(err);
                });
        });
    },

    updateCoursing(coursingRequest) {
        let { params, body } = coursingRequest;
        body.updated_at = new Date();
        body.account_id = ObjectId(body.account_id);
        let queryPayload = {
            _id: ObjectId(params.coursing_id),
            account_id: body.account_id
        }
        return new Promise((resolve, reject) => {
            getdb(COURSING).updateOne(queryPayload, { $set: body }, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:body });
            });
        })
    },

    getCoursingById(data) {
        return new Promise((resolve, reject) => {
            let query = [
                {
                    '$match': {
                        '_id': ObjectId(data.params.coursing_id),
                        'account_id': ObjectId(data.params.account_id)
                    }
                }
            ]
            getdb(COURSING).aggregate(query).toArray((err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result });
            });
        })
    },

}