const { TAXES } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    async createTax(tax) {
        try {
            tax.created_at = new Date();
            tax.updated_at = new Date();
            tax.store_id = ObjectId(tax.store_id);
    
            // Convert tax name to case-insensitive regex pattern
            const nameRegex = new RegExp(`^${tax.name}$`, 'i');
    
            // Check if a tax with the same name already exists for the same store (case-insensitive)
            const existingTax = await new Promise((resolve, reject) => {
                getdb(TAXES).findOne({
                    name: { $regex: nameRegex },
                    store_id: tax.store_id
                }, (err, existingTax) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(existingTax);
                    }
                });
            });
    
            if (existingTax) {
                // Name exists, prepare response with existing tax details
                return {
                    success: false,
                    message: `Tax with name '${tax.name}' already exists for this store.`,
                };
            }
    
            // Insert the tax into the database since no duplicate was found
            const result = await new Promise((resolve, reject) => {
                getdb(TAXES).insertOne(tax, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
    
            return { success: true, result:tax };
    
        } catch (error) {
            console.error('Error creating tax:', error);
            throw error;
        }
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

    async updateTaxes(taxRequest) {
        try {
            let { params, body } = taxRequest;
            body.updated_at = new Date();
            body.store_id = ObjectId(body.store_id); // Assuming store_id needs to be converted to ObjectId
            let queryPayload = {
                _id: ObjectId(params.tax_id)
            };
    
            // Fetch all taxes for the store (assuming TAXES is your collection name)
            const allTaxes = await getdb(TAXES).find({ store_id: body.store_id }).toArray();
    
            // Check if the updated name already exists for another tax (case-insensitive)
            const existingTax = allTaxes.find(tax =>
                tax.name.toLowerCase() === body.name.toLowerCase() &&
                tax._id.toString() !== params.tax_id
            );
    
            if (existingTax) {
                return {
                    success: false,
                    message: `Tax with '${body.name}' already exists for this store.`,
                };
            }
    
            // Update the tax document
            const result = await getdb(TAXES).updateOne(queryPayload, { $set: body });
    
            if (result.modifiedCount === 0) {
                return {
                    success: false,
                    message: `Tax with ID '${params.tax_id}' not found.`,
                };
            }
    
            return { success: true, result: body };
        } catch (error) {
            console.error('Error updating tax:', error);
            throw error; // Re-throw the error to be caught by the caller
        }
    },

    getTaxesById(data) {
        return new Promise((resolve, reject) => {
            let query = [
                {
                    '$match': {
                        '_id': ObjectId(data.params.id),
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