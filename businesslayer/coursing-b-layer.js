const { COURSING } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    createCoursing(coursing) {
        coursing.created_at = new Date();
        coursing.updated_at = new Date();
        coursing.store_id = ObjectId(coursing.store_id);
    
        // Convert coursing name to case-insensitive regex pattern
        const nameRegex = new RegExp(`^${coursing.name}$`, 'i');
    
        return new Promise((resolve, reject) => {
            // Check if a coursing with the same name already exists for the same store (case-insensitive)
            getdb(COURSING).findOne({ name: { $regex: nameRegex }, store_id: coursing.store_id }, (err, existingCoursing) => {
                if (err) {
                    return reject(err); // Handle error from findOne
                }
    
                if (existingCoursing) {
                    return resolve({
                        success: false,
                        message: `Coursing with name '${coursing.name}' already exists for this store.`,
                    });
                }
    
                // Insert the coursing into the database
                getdb(COURSING).insertOne(coursing, (err, result) => {
                    if (err) {
                        return reject(err); // Handle error from insertOne
                    }
                    return resolve({
                        success: true,
                        coursing,
                    });
                });
            });
        });
    },     

    getAllCoursing(params) {
        return new Promise((resolve, reject) => {
            getdb(COURSING).find({'store_id': ObjectId(params.store_id)}).toArray()
                .then((result) => {
                    resolve({ success: true, result });
                })
                .catch((err) => {
                    console.error("Error fetching all coursing:", err);
                    reject(err);
                });
        });
    },

    async updateCoursing(coursingRequest) {
        try {
            let { params, body } = coursingRequest;
            body.updated_at = new Date();
            body.store_id = ObjectId(body.store_id);
    
            let queryPayload = {
                _id: ObjectId(params.coursing_id)
            };
    
            // Fetch all coursings for the store
            const allCoursings = await getdb(COURSING).find({ store_id: body.store_id }).toArray();
    
            // Check if the updated name already exists for another coursing (case-insensitive)
            const existingCoursing = allCoursings.find(coursing =>
                coursing.name.toLowerCase() === body.name.toLowerCase() &&
                coursing._id.toString() !== params.coursing_id
            );
    
            if (existingCoursing) {
                return {
                    success: false,
                    message: `Coursing with name '${body.name}' already exists for this store.`,
                };
            }    
            // Update the coursing
            const updateResult = await getdb(COURSING).updateOne(queryPayload, { $set: body });
            if (updateResult.modifiedCount === 0) {
                return {
                    success: false,
                    message: `Coursing with ID '${params.coursing_id}' not found.`,
                }
            }
            return { success: true, result: body };
        } catch (error) {
            console.error('Error updating coursing:', error);
            throw error; // Re-throw the error to be caught by the caller
        }
    },    

    getCoursingById(data) {
        return new Promise((resolve, reject) => {
            let query = [
                {
                    '$match': {
                        '_id': ObjectId(data.params.coursing_id)
                    }
                }
            ]
            getdb(COURSING).aggregate(query).toArray((err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result });
            });
        })
    },

}