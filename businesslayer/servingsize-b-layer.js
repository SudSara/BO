const { SERVINGSIZE } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    async createServingSize(servingsize) {
        try {
            servingsize.created_at = new Date();
            servingsize.updated_at = new Date();
            servingsize.store_id = ObjectId(servingsize.store_id);
            servingsize.isActive = true;
    
            // Convert servingsize name to case-insensitive regex pattern
            const nameRegex = new RegExp(`^${servingsize.name}$`, 'i');
    
            // Check if a servingsize with the same name already exists for the same store (case-insensitive)
            const existingServingsize = await new Promise((resolve, reject) => {
                getdb(SERVINGSIZE).findOne({
                    name: { $regex: nameRegex },
                    store_id: servingsize.store_id
                }, (err, existingServingsize) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(existingServingsize);
                    }
                });
            });
    
            if (existingServingsize) {
                // Name exists, prepare response with existing servingsize details
                return {
                    success: false,
                    message: `servingsize with name '${servingsize.name}' already exists for this store.`,
                };
            }
    
            // Insert the servingsize into the database since no duplicate was found
            const result = await new Promise((resolve, reject) => {
                getdb(SERVINGSIZE).insertOne(servingsize, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
    
            return { success: true, result:servingsize };
    
        } catch (error) {
            console.error('Error creating servingsize :', error);
            throw error;
        }
    },

    getAllServingSizes(params) {
        return new Promise((resolve, reject) => {
            getdb(SERVINGSIZE).find({'store_id': ObjectId(params.store_id)}).toArray()
                .then((result) => {
                    resolve({ success: true, result });
                })
                .catch((err) => {
                    console.error("Error fetching all servingsizes:", err);
                    reject(err);
                });
        });
    },

    async updateServingSizes(servingsizeRequest) {
        try {
            let { params, body } = servingsizeRequest;
            body.updated_at = new Date();
            body.store_id = ObjectId(body.store_id);
            let queryPayload = {
                _id: ObjectId(params.servingsize_id)
            }
    
            // Fetch all servingSize (assuming SERVINGSIZE is your collection name)
            const allServingSize = await getdb(SERVINGSIZE).find({ store_id: body.store_id }).toArray();
    
            // Check if the updated name already exists for another serving size  (case-insensitive)
            const existingServingSize = allServingSize.find(servingSize =>
                servingSize.name.toLowerCase() === body.name.toLowerCase() &&
                servingSize._id.toString() !== params.servingsize_id
            );
    
            if (existingServingSize) {
                return {
                    success: false,
                    message: `serving size  with '${body.name}' already exists.`,
                };
            }
    
            // Update the serving size 
            const result = await getdb(SERVINGSIZE).updateOne(queryPayload, { $set: body });
            if (result.modifiedCount === 0) {
                return {
                    success: false,
                    message: `serving size with ID '${params.servingsize_id}' not found.`,
                }
            }
            return { success: true, result: body };
        } catch (error) {
            console.error('Error updating serving size:', error);
            throw error; // Re-throw the error to be caught by the caller
        }
    },

    getServingSizesById(data) {
        return new Promise((resolve, reject) => {
            let query = [
                {
                    '$match': {
                        '_id': ObjectId(data.params.servingsize_id)
                    }
                }
            ]
            getdb(SERVINGSIZE).aggregate(query).toArray((err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result });
            });
        })
    },

}