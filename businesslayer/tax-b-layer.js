const { TAXES } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    createTax(tax) {
        tax.created_at = new Date();
        tax.updated_at = new Date();
        tax.account_id = ObjectId(tax.account_id);
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
            'account_id': ObjectId(params.account_id)
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
        body.account_id = ObjectId(body.account_id);
        let queryPayload = {
            _id: ObjectId(params.tax_id),
            account_id: body.account_id
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
                        'account_id': ObjectId(data.query.account_id)
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
                account_id: ObjectId(query.account_id)
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