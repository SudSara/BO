const { ROLES } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    async createRole(role) {
        try {
            role.created_at = new Date();
            role.updated_at = new Date();
            role.store_id = ObjectId(role.store_id);
    
            // Convert role name to case-insensitive regex pattern
            const nameRegex = new RegExp(`^${role.name}$`, 'i');
    
            // Check if a role with the same name already exists for the same store (case-insensitive)
            const existingRole = await new Promise((resolve, reject) => {
                getdb(ROLES).findOne({
                    name: { $regex: nameRegex },
                    store_id: role.store_id
                }, (err, existingRole) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(existingRole);
                    }
                });
            });
    
            if (existingRole) {
                // Name exists, prepare response with existing role details
                return {
                    success: false,
                    message: `Role with name '${role.name}' already exists for this store.`,
                };
            }
    
            // Insert the role into the database since no duplicate was found
            const result = await new Promise((resolve, reject) => {
                getdb(ROLES).insertOne(role, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
    
            return { success: true, result: role };
    
        } catch (error) {
            console.error('Error creating role:', error);
            throw error;
        }
    },

    getAllRoles(params) {
        return new Promise((resolve, reject) => {
            getdb(ROLES).find({'store_id': ObjectId(params.store_id)}).toArray()
                .then((result) => {
                    resolve({ success: true, result });
                })
                .catch((err) => {
                    console.error("Error fetching all roles:", err);
                    reject(err);
                });
        });
    },

    async updateRoles(roleRequest) {
        try {
            let { params, body } = roleRequest;
            body.updated_at = new Date();
            let queryPayload = {
                _id: ObjectId(params.role_id)
            };
    
            // Fetch all roles (assuming ROLES is your collection name)
            const allRoles = await getdb(ROLES).find({}).toArray();
    
            // Check if the updated name already exists for another role (case-insensitive)
            const existingRole = allRoles.find(role =>
                role.name.toLowerCase() === body.name.toLowerCase() &&
                role._id.toString() !== params.role_id
            );
    
            if (existingRole) {
                return {
                    success: false,
                    message: `Role with name '${body.name}' already exists.`,
                };
            }
    
            // Update the role document
            const result = await getdb(ROLES).updateOne(queryPayload, { $set: body });
    
            if (result.modifiedCount === 0) {
                return {
                    success: false,
                    message: `Role with ID '${params.role_id}' not found.`,
                };
            }
    
            return { success: true, result: body };
        } catch (error) {
            console.error('Error updating role:', error);
            throw error; // Re-throw the error to be caught by the caller
        }
    },

    getRolesById(data) {
        return new Promise((resolve, reject) => {
            let query = [
                {
                    '$match': {
                        '_id': ObjectId(data.params.role_id)
                    }
                }
            ]
            getdb(ROLES).aggregate(query).toArray((err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result });
            });
        })
    },

    deleteRolesById(req) {
        let { params } = req;
        return new Promise((resolve, reject) => {
            let queryPayload = {
                _id: ObjectId(params.role_id)
            }
            getdb(ROLES).deleteOne(queryPayload, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result: `Deleted role successfully` });
            });
        });
    }

}