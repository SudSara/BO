const { PAYMENTTYPES } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    async createPaymentType(paymentType) {
        try {
            paymentType.created_at = new Date();
            paymentType.updated_at = new Date();
            paymentType.store_id = ObjectId(paymentType.store_id);
            paymentType.isActive = true;
    
            // Convert payment type name to case-insensitive regex pattern
            const nameRegex = new RegExp(`^${paymentType.paymentTypeName}$`, 'i');
    
            // Check if a payment type with the same name already exists for the same store (case-insensitive)
            const existingPaymentType = await new Promise((resolve, reject) => {
                getdb(PAYMENTTYPES).findOne({
                    paymentTypeName: { $regex: nameRegex },
                    store_id: paymentType.store_id
                }, (err, existingPaymentType) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(existingPaymentType);
                    }
                });
            });
    
            if (existingPaymentType) {
                // Name exists, prepare response with existing payment type details
                return {
                    success: false,
                    message: `Payment type with name '${paymentType.paymentTypeName}' already exists for this store.`,
                };
            }
    
            // Insert the payment type into the database since no duplicate was found
            const result = await new Promise((resolve, reject) => {
                getdb(PAYMENTTYPES).insertOne(paymentType, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
    
            return { success: true, result:paymentType };
    
        } catch (error) {
            console.error('Error creating payment type:', error);
            throw error;
        }
    },

    getAllPaymentTypes(params) {
        let paymentTypePayload = {
            'store_id': ObjectId(params.store_id)
        }
        return new Promise((resolve, reject) => {
            getdb(PAYMENTTYPES).find(paymentTypePayload).toArray()
                .then((result) => {
                    resolve({ success: true, result });
                })
                .catch((err) => {
                    console.error("Error fetching all paymentTypes:", err);
                    reject(err);
                });
        });
    },

    async updatePaymentTypes(paymentTypeRequest) {
        try {
            let { params, body } = paymentTypeRequest;
            body.store_id = ObjectId(body.store_id);
            body.updated_at = new Date();
            body.store_id = ObjectId(body.store_id);
            // Convert paymentType_id to ObjectId
            let queryPayload = {
                _id: ObjectId(params.paymentType_id)
            };
    
            // Fetch all payment types (assuming PAYMENTTYPES is your collection name)
            const allPaymentTypes = await getdb(PAYMENTTYPES).find({ store_id: body.store_id }).toArray();
    
            // Check if the updated name already exists for another payment type (case-insensitive)
            const existingPaymentType = allPaymentTypes.find(paymentType =>
                paymentType.paymentTypeName.toLowerCase() === body.paymentTypeName.toLowerCase() &&
                paymentType._id.toString() !== params.paymentType_id
            );
    
            if (existingPaymentType) {
                return {
                    success: false,
                    message: `Payment type with name '${body.paymentTypeName}' already exists.`,
                };
            }
    
            // Update the payment type
            const result = await getdb(PAYMENTTYPES).updateOne(queryPayload, { $set: body });
            if (result.modifiedCount === 0) {
                return {
                    success: false,
                    message: `Payment with ID '${params.paymentType_id}' not found.`,
                }
            }
            return { success: true, result: body };
        } catch (error) {
            console.error('Error updating payment type:', error);
            throw error; // Re-throw the error to be caught by the caller
        }
    },

    getPaymentTypesById(data) {
        return new Promise((resolve, reject) => {
            let query = [
                {
                    '$match': {
                        '_id': ObjectId(data.params.id),
                    }
                }
            ]
            getdb(PAYMENTTYPES).aggregate(query).toArray((err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result });
            });
        })
    },

    deletePaymentTypesById(req) {
        let { params, query } = req;
        return new Promise((resolve, reject) => {
            let queryPayload = {
                _id: ObjectId(params.paymentType_id),
            }
            getdb(PAYMENTTYPES).deleteOne(queryPayload, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result: `Deleted paymentType successfully` });
            });
        });
    }

}