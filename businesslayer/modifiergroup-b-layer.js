const { MODIFIERGROUP } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    createModifierGroup(modifierGroup) {
        modifierGroup.created_at = new Date();
        modifierGroup.updated_at = new Date();
        modifierGroup.store_id = ObjectId(modifierGroup.store_id);
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
            getdb(MODIFIERGROUP).find({'store_id': ObjectId(params.store_id)}).toArray()
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
        let queryPayload = {
            _id: ObjectId(params.modifierGroup_id),
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
                        'store_id': ObjectId(data.params.store_id)
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