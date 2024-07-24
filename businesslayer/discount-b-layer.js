const { DISCOUNTS } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    async createDiscount(discount) {
        try {
            discount.created_at = new Date();
            discount.updated_at = new Date();
            discount.store_id = ObjectId(discount.store_id);
            discount.isActive = true;
    
            // Convert discount name to case-insensitive regex pattern
            const nameRegex = new RegExp(`^${discount.name}$`, 'i');
    
            // Check if a discount with the same name already exists for the same store (case-insensitive)
            const existingDiscount = await new Promise((resolve, reject) => {
                getdb(DISCOUNTS).findOne({
                    name: { $regex: nameRegex },
                    store_id: discount.store_id
                }, (err, existingDiscount) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(existingDiscount);
                    }
                });
            });
    
            if (existingDiscount) {
                // Name exists, prepare response with existing discount details
                return {
                    success: false,
                    message: `Discount with name '${discount.name}' already exists for this store.`,
                };
            }
    
            // Insert the discount into the database since no duplicate was found
            const result = await new Promise((resolve, reject) => {
                getdb(DISCOUNTS).insertOne(discount, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
    
            return { success: true, result:discount };
    
        } catch (error) {
            console.error('Error creating discount:', error);
            throw error;
        }
    },
    

    getAllDiscounts(params) {
        let discountPayload = {
            'store_id': ObjectId(params.store_id)
        }
        return new Promise((resolve, reject) => {
            getdb(DISCOUNTS).find(discountPayload).toArray()
                .then((result) => {
                    resolve({ success: true, result });
                })
                .catch((err) => {
                    console.error("Error fetching all discounts:", err);
                    reject(err);
                });
        });
    },

    async updateDiscounts(discountRequest) {
        try {
            let { params, body } = discountRequest;
            body.updated_at = new Date();
            body.store_id = ObjectId(body.store_id);
    
            let queryPayload = {
                _id: ObjectId(params.discount_id),
            }
    
            // Fetch all discounts for the store
            const allDiscounts = await getdb(DISCOUNTS).find({ store_id: body.store_id }).toArray();
    
            // Check if the updated name already exists for another discount (case-insensitive)
            const existingDiscount = allDiscounts.find(discount =>
                discount.name.toLowerCase() === body.name.toLowerCase() &&
                discount._id.toString() !== params.discount_id
            );
    
            if (existingDiscount) {
                return {
                    success: false,
                    message: `Discount with name '${body.name}' already exists for this store.`,
                };
            }
    
            // Update the discount
            const result = await getdb(DISCOUNTS).updateOne(queryPayload, { $set: body })
            if (result.modifiedCount === 0) {
                return {
                    success: false,
                    message: `Discount with ID '${params.discount_id}' not found.`,
                }
            }
            return { success: true, result:body };
        } catch (error) {
            console.error('Error updating discount:', error);
            throw error; // Re-throw the error to be caught by the caller
        }
    },

    getDiscountsById(data) {
        return new Promise((resolve, reject) => {
            let query = [
                {
                    '$match': {
                        '_id': ObjectId(data.params.id)
                    }
                }
            ]
            console.log(query,"dsfds")
            getdb(DISCOUNTS).aggregate(query).toArray((err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result });
            });
        })
    },
}