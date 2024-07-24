const { CATEGORY } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    async createCategory(category) {
        return new Promise((resolve, reject) => {
            try {
                category.created_at = new Date();
                category.updated_at = new Date();
                category.store_id = ObjectId(category.store_id);
    
                // Convert category name to case-insensitive regex pattern
                const nameRegex = new RegExp(`^${category.name}$`, 'i');
    
                // Check if a category with the same name already exists for the same store (case-insensitive)
                getdb(CATEGORY).findOne({ name: { $regex: nameRegex }, store_id: category.store_id }, async (err, existingCategory) => {
                    if (err) {
                        return reject(err); // Handle error from findOne
                    }
    
                    if (existingCategory) {
                        // Name exists, prepare response with existing category details
                        return resolve({
                            success: false,
                            message: `Category with name '${category.name}' already exists for this store.`,
                        });
                    } else {
                        // Insert the category into the database
                        getdb(CATEGORY).insertOne(category, (err, result) => {
                            if (err) {
                                return reject(err); // Handle error from insertOne
                            }
                            return resolve({
                                success: true,
                                category,
                            });
                        });
                    }
                });
            } catch (error) {
                // Handle any synchronous errors
                console.error('Error creating category:', error);
                reject(error);
            }
        });
    },    

    getAllCategory(params) {
        let payload = {
            'store_id': ObjectId(params.store_id)
        }
        return new Promise((resolve, reject) => {
            getdb(CATEGORY).find(payload).toArray()
                .then((result) => {
                    resolve({ success: true, result });
                })
                .catch((err) => {
                    console.error("Error fetching all categories:", err);
                    reject(err);
                });
        });
    },

    async updateCategory(req) {
        try {
            let { params, body } = req;
            body.updated_at = new Date();
            body.store_id = ObjectId(body.store_id);
    
            let queryPayload = {
                _id: ObjectId(params.category_id),
            };
    
            // Fetch all categories for the store
            const allCategories = await getdb(CATEGORY).find({ store_id: body.store_id }).toArray();
    
            // Check if the updated name already exists for another category (case-insensitive)
            const existingCategory = allCategories.find(category =>
                category.name.toLowerCase() === body.name.toLowerCase() &&
                category._id.toString() !== params.category_id
            );
    
            if (existingCategory) {
                return {
                    success: false,
                    message: `Category with name '${body.name}' already exists for this store.`,
                };
            }
    
            // Update the category
            const result = await getdb(CATEGORY).updateOne(queryPayload, { $set: body })
            if (result.modifiedCount === 0) {
                return {
                    success: false,
                    message: `Category with ID '${params.category_id}' not found.`,
                }
            }
            return { success: true, result:body };
        } catch (error) {
            console.error('Error updating category:', error);
            throw error; // Re-throw the error to be caught by the caller
        }
    },    

    getCategoryById(data) {
        return new Promise((resolve, reject) => {
            let query = [
                {
                    '$match': {
                        '_id': ObjectId(data.params.id),
                    }
                }
            ]
            getdb(CATEGORY).aggregate(query).toArray((err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result });
            });
        })
    },

    deleteCategoryById(req) {
        let { params, query } = req;
        return new Promise((resolve, reject) => {
            let queryPayload = {
                _id: ObjectId(params.category_id),
                store_id: ObjectId(query.store_id)
            }
            getdb(CATEGORY).deleteOne(queryPayload, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result: `Deleted category successfully` });
            });
        });
    },
    getCateoryMenu(req){
        return new Promise((resolve,reject)=>{
            let query = [
                {
                  '$match': {
                    'store_id': new ObjectId(req.params.store_id)
                  }
                }, {
                  '$lookup': {
                    'from': 'menuitems', 
                    'localField': '_id', 
                    'foreignField': 'category_id', 
                    'as': 'menu_items'
                  }
                }
            ]
            getdb(CATEGORY).aggregate(query).toArray((err,result)=>{
                if(err){
                    return reject(err);
                }
                return resolve(result);
            })
        })
    }

}