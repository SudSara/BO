const { CUSTOMERS } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    createCustomer(customer) {
        customer.created_at = new Date();
        customer.updated_at = new Date();
        customer.account_id= ObjectId(customer.account_id);
        customer.store_id = ObjectId(customer.store_id);
        return new Promise((resolve, reject) => {
            getdb(CUSTOMERS).insertOne(customer, async (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:customer });
            })
        })
    },

    getAllCustomers(params) {
        let customerPayload = {
            'account_id': ObjectId(params.account_id),
            'store_id': ObjectId(params.store_id)
        }
        return new Promise((resolve, reject) => {
            getdb(CUSTOMERS).find(customerPayload).toArray()
                .then((result) => {
                    resolve({ success: true, result });
                })
                .catch((err) => {
                    console.error("Error fetching all customers:", err);
                    reject(err);
                });
        });
    },

    updateCustomers(customerRequest) {
        let { params, body } = customerRequest;
        body.updated_at = new Date();
        body.account_id= ObjectId(body.account_id);
        body.store_id = ObjectId(body.store_id);
        let queryPayload = {
            _id: ObjectId(params.customer_id),
            account_id: body.account_id,
            store_id: body.store_id
        }
        return new Promise((resolve, reject) => {
            getdb(CUSTOMERS).updateOne(queryPayload, { $set: body }, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:body });
            });
        })
    },

    getCustomersById(data) {
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
            getdb(CUSTOMERS).aggregate(query).toArray((err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result });
            });
        })
    },

    deleteCustomersById(req) {
        let { params, query } = req;
        return new Promise((resolve, reject) => {
            let queryPayload = {
                _id: ObjectId(params.customer_id),
                account_id: ObjectId(query.account_id),
                store_id: ObjectId(query.store_id)
            }
            getdb(CUSTOMERS).deleteOne(queryPayload, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result: `Deleted customer successfully` });
            });
        });
    }

}