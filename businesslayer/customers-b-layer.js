const { CUSTOMERS } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    createCustomer(customer) {
        customer.created_at = new Date();
        customer.updated_at = new Date();
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
            'store_id': ObjectId(params.store_id)
        }
        return new Promise((resolve, reject) => {
            getdb(CUSTOMERS).find(customerPayload).toArray((err,result) => {
                    if(err){
                        reject(err)
                    }
                    resolve({success:true,result})
                })
        });
    },

    updateCustomers(customerRequest) {
        let { params, body } = customerRequest;
        body.updated_at = new Date();
        let queryPayload = {
            _id: ObjectId(params.customer_id)
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
                        '_id': ObjectId(data.params.id)
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
                _id: ObjectId(params.customer_id)
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