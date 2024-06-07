const { USERS } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    createUser(user) {
        user.created_at = new Date();
        user.updated_at = new Date();
        user.account_id = ObjectId(user.account_id);
        user.store_id = ObjectId(user.store_id);
        return new Promise((resolve, reject) => {
            getdb(USERS).insertOne(user, async (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:user });
            })
        })
    },

    getAllUsers(params) {
        let userPayload = {
            'account_id': ObjectId(params.account_id),
            'store_id': ObjectId(params.store_id)
        }
        return new Promise((resolve, reject) => {
            getdb(USERS).find(userPayload).toArray()
                .then((result) => {
                    resolve({ success: true, result });
                })
                .catch((err) => {
                    console.error("Error fetching all users:", err);
                    reject(err);
                });
        });
    },

    updateUsers(userRequest) {
        let { params, body } = userRequest;
        body.updated_at = new Date();
        body.account_id = ObjectId(body.account_id);
        body.store_id = ObjectId(body.store_id);
        let queryPayload = {
            _id: ObjectId(params.user_id),
            account_id: body.account_id,
            store_id: body.store_id
        }
        return new Promise((resolve, reject) => {
            getdb(USERS).updateOne(queryPayload, { $set: body }, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:body });
            });
        })
    },

    getUsersById(data) {
        return new Promise((resolve, reject) => {
            let query = [
                {
                    '$match': {
                        '_id': ObjectId(data.params.id),
                        'account_id': ObjectId(data.query.account_id),
                        'store_id': ObjectId(data.query.store_id)
                    }
                }
            ]
            getdb(USERS).aggregate(query).toArray((err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result });
            });
        })
    },

    deleteUsersById(req) {
        let { params, query } = req;
        return new Promise((resolve, reject) => {
            let queryPayload = {
                _id: ObjectId(params.user_id),
                account_id: ObjectId(query.account_id),
                store_id: ObjectId(query.store_id)
            }
            getdb(USERS).deleteOne(queryPayload, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result: `Deleted user successfully` });
            });
        });
    }

}