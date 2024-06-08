const { MODIFIERS } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    createModifier(modifier) {
        modifier.created_at = new Date();
        modifier.updated_at = new Date();
        modifier.account_id = ObjectId(modifier.account_id);
        return new Promise((resolve, reject) => {
            getdb(MODIFIERS).insertOne(modifier, async (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:modifier });
            })
        })
    },

    getAllModifiers(params) {
        return new Promise((resolve, reject) => {
            getdb(MODIFIERS).find({'account_id': ObjectId(params.account_id)}).toArray()
                .then((result) => {
                    resolve({ success: true, result });
                })
                .catch((err) => {
                    console.error("Error fetching all modifiers:", err);
                    reject(err);
                });
        });
    },

    updateModifiers(modifierRequest) {
        let { params, body } = modifierRequest;
        body.updated_at = new Date();
        body.account_id = ObjectId(body.account_id);
        let queryPayload = {
            _id: ObjectId(params.modifier_id),
            account_id: body.account_id
        }
        return new Promise((resolve, reject) => {
            getdb(MODIFIERS).updateOne(queryPayload, { $set: body }, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:body });
            });
        })
    },

    getModifiersById(data) {
        return new Promise((resolve, reject) => {
            let query = [
                {
                    '$match': {
                        '_id': ObjectId(data.params.modifier_id),
                        'account_id': ObjectId(data.params.account_id)
                    }
                }
            ]
            getdb(MODIFIERS).aggregate(query).toArray((err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result });
            });
        })
    },

}