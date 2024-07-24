const { PAYMENTMETHODS } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    async createPaymentMethod(paymentMethod) {
        try {
            paymentMethod.created_at = new Date();
            paymentMethod.updated_at = new Date();
            paymentMethod.store_id = ObjectId(paymentMethod.store_id);
    
            // Convert payment method name to case-insensitive regex pattern
            const nameRegex = new RegExp(`^${paymentMethod.paymentMethod}$`, 'i');
    
            // Check if a payment method with the same name already exists for the same store (case-insensitive)
            const existingPaymentMethod = await new Promise((resolve, reject) => {
                getdb(PAYMENTMETHODS).findOne({
                    paymentMethod: { $regex: nameRegex },
                    store_id: paymentMethod.store_id
                }, (err, existingPaymentMethod) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(existingPaymentMethod);
                    }
                });
            });
    
            if (existingPaymentMethod) {
                // Name exists, prepare response with existing payment method details
                return {
                    success: false,
                    message: `Payment method with name '${paymentMethod.paymentMethod}' already exists for this store.`,
                };
            }
    
            // Insert the payment method into the database since no duplicate was found
            const result = await new Promise((resolve, reject) => {
                getdb(PAYMENTMETHODS).insertOne(paymentMethod, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
    
            return { success: true, result:paymentMethod };
    
        } catch (error) {
            console.error('Error creating payment method:', error);
            throw error;
        }
    },

    getAllPaymentMethods(params) {
        return new Promise((resolve, reject) => {
            getdb(PAYMENTMETHODS).find({'store_id': ObjectId(params.store_id)}).toArray()
                .then((result) => {
                    resolve({ success: true, result });
                })
                .catch((err) => {
                    console.error("Error fetching all paymentMethods:", err);
                    reject(err);
                });
        });
    },

    async updatePaymentMethods(paymentMethodRequest) {
        try {
            let { params, body } = paymentMethodRequest;
            body.updated_at = new Date();
            body.store_id = ObjectId(body.store_id);
            // Convert paymentMethod_id to ObjectId
            let queryPayload = {
                _id: ObjectId(params.paymentMethod_id)
            };
    
            // Fetch all paymentMethod groups (assuming PAYMENTMETHODS is your collection name)
            const allPaymentMethod = await getdb(PAYMENTMETHODS).find({ store_id: body.store_id }).toArray();
    
            // Check if the updated name already exists for another modifier group (case-insensitive)
            const existingPaymentMethod = allPaymentMethod.find(paymentMethod =>
                paymentMethod.paymentMethod.toLowerCase() === body.paymentMethod.toLowerCase() &&
                paymentMethod._id.toString() !== params.paymentMethod_id
            );
    
            if (existingPaymentMethod) {
                return {
                    success: false,
                    message: `payment method  with '${body.paymentMethod}' already exists.`,
                };
            }
    
            // Update the modifier group
            const result = await getdb(PAYMENTMETHODS).updateOne(queryPayload, { $set: body });
            if (result.modifiedCount === 0) {
                return {
                    success: false,
                    message: `payment method with ID '${params.paymentMethod_id}' not found.`,
                }
            }
            return { success: true, result: body };
        } catch (error) {
            console.error('Error updating Payment method  group:', error);
            throw error; // Re-throw the error to be caught by the caller
        }
    },

    getPaymentMethodsById(data) {
        return new Promise((resolve, reject) => {
            let query = [
                {
                    '$match': {
                        '_id': ObjectId(data.params.paymentMethod_id)
                    }
                }
            ]
            getdb(PAYMENTMETHODS).aggregate(query).toArray((err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result });
            });
        })
    },

}