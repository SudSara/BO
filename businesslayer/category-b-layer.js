const { CATEGORY } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    async createCategory(category) {
        try {
            category.created_at = new Date();
            category.updated_at = new Date();
            category.store_id = ObjectId(category.store_id);
    
            // Check if a category with the same name already exists for the same store
            const existingCategory = await getdb(CATEGORY).findOne({ name: category.name, store_id: category.store_id });
            if (existingCategory) {
                throw new Error(`Category with name '${category.name}' already exists for this store.`);
            }
    
            // Insert the category into the database
            const result = await getdb(CATEGORY).insertOne(category);
    
            return { success: true, category };
        } catch (error) {
            console.error('Error creating category:', error);
            throw error; // Re-throw the error to be caught by the caller
        }
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
            let queryPayload = {
                _id: ObjectId(params.category_id),
            };
    
            // Check if another category with the same name exists for the same store
            const existingCategory = await getdb(CATEGORY).findOne({ name: body.name, store_id: body.store_id });
            if (existingCategory) {
                throw new Error(`Category with name '${body.name}' already exists.`);
            }
    
            // Update the category
            const result = await getdb(CATEGORY).updateOne(queryPayload, { $set: body });
    
            if (result.modifiedCount === 0) {
                throw new Error(`Category with ID ${params.category_id} not found.`);
            }
    
            return { success: true, body };
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