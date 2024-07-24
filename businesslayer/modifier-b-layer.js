const { MODIFIERS } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    async createModifier(modifier) {
        try {
            modifier.created_at = new Date();
            modifier.updated_at = new Date();
            modifier.store_id = ObjectId(modifier.store_id);
            modifier.isActive = true;
    
            // Convert modifier name to case-insensitive regex pattern
            const nameRegex = new RegExp(`^${modifier.name}$`, 'i');
    
            // Check if a modifier with the same name already exists for the same store (case-insensitive)
            const existingModifier = await new Promise((resolve, reject) => {
                getdb(MODIFIERS).findOne({
                    name: { $regex: nameRegex },
                    store_id: modifier.store_id
                }, (err, existingModifier) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(existingModifier);
                    }
                });
            });
    
            if (existingModifier) {
                // Name exists, prepare response with existing modifier details
                return {
                    success: false,
                    message: `Modifier with name '${modifier.name}' already exists for this store.`,
                };
            }
    
            // Insert the modifier into the database since no duplicate was found
            const result = await new Promise((resolve, reject) => {
                getdb(MODIFIERS).insertOne(modifier, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
    
            return { success: true, result:modifier };
    
        } catch (error) {
            console.error('Error creating modifier:', error);
            throw error;
        }
    },    

    getAllModifiers(params) {
        return new Promise((resolve, reject) => {
            getdb(MODIFIERS).find({'store_id': ObjectId(params.store_id)}).toArray()
                .then((result) => {
                    resolve({ success: true, result });
                })
                .catch((err) => {
                    console.error("Error fetching all modifiers:", err);
                    reject(err);
                });
        });
    },

    async updateModifiers(modifierRequest) {
        try {
            let { params, body } = modifierRequest;
            body.updated_at = new Date();
            body.store_id = ObjectId(body.store_id);
            // Convert modifier_id to ObjectId
            let queryPayload = {
                _id: ObjectId(params.modifier_id)
            };
    
            // Fetch all modifiers (assuming MODIFIERS is your collection name)
            const allModifiers = await getdb(MODIFIERS).find({ store_id: body.store_id }).toArray();
    
            // Check if the updated name already exists for another modifier (case-insensitive)
            const existingModifier = allModifiers.find(modifier =>
                modifier.name.toLowerCase() === body.name.toLowerCase() &&
                modifier._id.toString() !== params.modifier_id
            );
    
            if (existingModifier) {
                return {
                    success: false,
                    message: `Modifier with name '${body.name}' already exists.`,
                };
            }
    
            // Update the modifier
            const result = await getdb(MODIFIERS).updateOne(queryPayload, { $set: body });
            if (result.modifiedCount === 0) {
                return {
                    success: false,
                    message: `Modifier with ID '${params.modifier_id}' not found.`,
                }
            }
    
            return { success: true, result: body };
        } catch (error) {
            console.error('Error updating modifier:', error);
            throw error; // Re-throw the error to be caught by the caller
        }
    },

    getModifiersById(data) {
        return new Promise((resolve, reject) => {
            let query = [
                {
                    '$match': {
                        '_id': ObjectId(data.params.modifier_id)
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