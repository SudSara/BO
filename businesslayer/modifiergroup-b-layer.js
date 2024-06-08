const { MODIFIERGROUP } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    createModifierGroup(modifierGroup) {
        modifierGroup.created_at = new Date();
        modifierGroup.updated_at = new Date();
        modifierGroup.account_id = ObjectId(modifierGroup.account_id);
        return new Promise((resolve, reject) => {
            getdb(MODIFIERGROUP).insertOne(modifierGroup, async (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:modifierGroup });
            })
        })
    },

    getAllModifierGroups(params) {
        return new Promise((resolve, reject) => {
            getdb(MODIFIERGROUP).find({'account_id': ObjectId(params.account_id)}).toArray()
                .then((result) => {
                    resolve({ success: true, result });
                })
                .catch((err) => {
                    console.error("Error fetching all modifierGroups:", err);
                    reject(err);
                });
        });
    },

    updateModifierGroups(modifierGroupRequest) {
        let { params, body } = modifierGroupRequest;
        body.updated_at = new Date();
        body.account_id = ObjectId(body.account_id);
        let queryPayload = {
            _id: ObjectId(params.modifierGroup_id),
            account_id: body.account_id
        }
        return new Promise((resolve, reject) => {
            getdb(MODIFIERGROUP).updateOne(queryPayload, { $set: body }, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:body });
            });
        })
    },

    getModifierGroupsById(data) {
        return new Promise((resolve, reject) => {
            let query = [
                {
                    '$match': {
                        '_id': ObjectId(data.params.modifierGroup_id),
                        'account_id': ObjectId(data.params.account_id)
                    }
                }
            ]
            getdb(MODIFIERGROUP).aggregate(query).toArray((err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result });
            });
        })
    },

}