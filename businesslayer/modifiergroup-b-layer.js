const { MODIFIERGROUP } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    async createModifierGroup(modifierGroup) {
        try {
            modifierGroup.created_at = new Date();
            modifierGroup.updated_at = new Date();
            modifierGroup.store_id = ObjectId(modifierGroup.store_id);
            modifierGroup.isActive = true;
    
            // Convert modifier group name to case-insensitive regex pattern
            const nameRegex = new RegExp(`^${modifierGroup.name}$`, 'i');
    
            // Check if a modifier group with the same name already exists for the same store (case-insensitive)
            const existingModifierGroup = await new Promise((resolve, reject) => {
                getdb(MODIFIERGROUP).findOne({
                    name: { $regex: nameRegex },
                    store_id: modifierGroup.store_id
                }, (err, existingModifierGroup) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(existingModifierGroup);
                    }
                });
            });
    
            if (existingModifierGroup) {
                // Name exists, prepare response with existing modifier group details
                return {
                    success: false,
                    message: `Modifier group with name '${modifierGroup.name}' already exists for this store.`,
                };
            }
    
            // Insert the modifier group into the database since no duplicate was found
            const result = await new Promise((resolve, reject) => {
                getdb(MODIFIERGROUP).insertOne(modifierGroup, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
    
            return { success: true, result:modifierGroup };
    
        } catch (error) {
            console.error('Error creating modifier group:', error);
            throw error;
        }
    },

    getAllModifierGroups(params) {
        return new Promise((resolve, reject) => {
            getdb(MODIFIERGROUP).find({'store_id': ObjectId(params.store_id)}).toArray()
                .then((result) => {
                    resolve({ success: true, result });
                })
                .catch((err) => {
                    console.error("Error fetching all modifierGroups:", err);
                    reject(err);
                });
        });
    },

    async updateModifierGroups(modifierGroupRequest) {
        try {
            let { params, body } = modifierGroupRequest;
            body.updated_at = new Date();
            body.store_id = ObjectId(body.store_id);
            // Convert modifierGroup_id to ObjectId
            let queryPayload = {
                _id: ObjectId(params.modifierGroup_id)
            };
    
            // Fetch all modifier groups (assuming MODIFIERGROUP is your collection name)
            const allModifierGroups = await getdb(MODIFIERGROUP).find({ store_id: body.store_id }).toArray();
    
            // Check if the updated name already exists for another modifier group (case-insensitive)
            const existingModifierGroup = allModifierGroups.find(modifierGroup =>
                modifierGroup.name.toLowerCase() === body.name.toLowerCase() &&
                modifierGroup._id.toString() !== params.modifierGroup_id
            );
    
            if (existingModifierGroup) {
                return {
                    success: false,
                    message: `Modifier group with name '${body.name}' already exists.`,
                };
            }
    
            // Update the modifier group
            const result = await getdb(MODIFIERGROUP).updateOne(queryPayload, { $set: body });
            if (result.modifiedCount === 0) {
                return {
                    success: false,
                    message: `ModifierGroup with ID '${params.modifierGroup_id}' not found.`,
                }
            }
            return { success: true, result: body };
        } catch (error) {
            console.error('Error updating modifier group:', error);
            throw error; // Re-throw the error to be caught by the caller
        }
    }
    ,

    getModifierGroupsById(data) {
        return new Promise((resolve, reject) => {
            let query = [
                {
                    '$match': {
                        '_id': ObjectId(data.params.modifierGroup_id)
                    }
                }
            ]
            getdb(MODIFIERGROUP).aggregate(query).toArray((err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result });
            });
        })
    },

}