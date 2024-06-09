const { TAXES } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    createTax(tax) {
        tax.created_at = new Date();
        tax.updated_at = new Date();
        tax.store_id = ObjectId(tax.store_id);
        return new Promise((resolve, reject) => {
            getdb(TAXES).insertOne(tax, async (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:tax });
            })
        })
    },

    getAllTaxes(params) {
        let taxPayload = {
            'store_id': ObjectId(params.store_id)
        }
        return new Promise((resolve, reject) => {
            getdb(TAXES).find(taxPayload).toArray()
                .then((result) => {
                    resolve({ success: true, result });
                })
                .catch((err) => {
                    console.error("Error fetching all taxs:", err);
                    reject(err);
                });
        });
    },

    updateTaxes(taxRequest) {
        let { params, body } = taxRequest;
        body.updated_at = new Date();
        body.store_id = ObjectId(body.store_id);
        let queryPayload = {
            _id: ObjectId(params.tax_id),
            store_id: body.store_id
        }
        return new Promise((resolve, reject) => {
            getdb(TAXES).updateOne(queryPayload, { $set: body }, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:body });
            });
        })
    },

    getTaxesById(data) {
        return new Promise((resolve, reject) => {
            let query = [
                {
                    '$match': {
                        '_id': ObjectId(data.params.id),
                        'store_id': ObjectId(data.query.store_id)
                    }
                }
            ]
            getdb(TAXES).aggregate(query).toArray((err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result });
            });
        })
    },

    deleteTaxesById(req) {
        let { params, query } = req;
        return new Promise((resolve, reject) => {
            let queryPayload = {
                _id: ObjectId(params.tax_id),
                store_id: ObjectId(query.store_id)
            }
            getdb(TAXES).deleteOne(queryPayload, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result: `Deleted tax successfully` });
            });
        });
    }

}