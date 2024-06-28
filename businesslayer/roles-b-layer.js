const { ROLES } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    createRole(role) {
        role.created_at = new Date();
        role.updated_at = new Date();
        role.store_id = ObjectId(role.store_id);
        return new Promise((resolve, reject) => {
            getdb(ROLES).insertOne(role, async (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:role });
            })
        })
    },

    getAllRoles(params) {
        return new Promise((resolve, reject) => {
            getdb(ROLES).find({'store_id': ObjectId(params.store_id)}).toArray()
                .then((result) => {
                    resolve({ success: true, result });
                })
                .catch((err) => {
                    console.error("Error fetching all roles:", err);
                    reject(err);
                });
        });
    },

    updateRoles(roleRequest) {
        let { params, body } = roleRequest;
        body.updated_at = new Date();
        let queryPayload = {
            _id: ObjectId(params.role_id)
        }
        return new Promise((resolve, reject) => {
            getdb(ROLES).updateOne(queryPayload, { $set: body }, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:body });
            });
        })
    },

    getRolesById(data) {
        return new Promise((resolve, reject) => {
            let query = [
                {
                    '$match': {
                        '_id': ObjectId(data.params.role_id)
                    }
                }
            ]
            getdb(ROLES).aggregate(query).toArray((err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result });
            });
        })
    },

    deleteRolesById(req) {
        let { params } = req;
        return new Promise((resolve, reject) => {
            let queryPayload = {
                _id: ObjectId(params.role_id)
            }
            getdb(ROLES).deleteOne(queryPayload, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result: `Deleted role successfully` });
            });
        });
    }

}