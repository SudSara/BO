const { CATEGORY } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    createCategory(category) {
        category.created_at = new Date();
        category.updated_at = new Date();
        category.account_id= ObjectId(category.account_id);
        category.store_id = ObjectId(category.store_id);
        return new Promise((resolve, reject) => {
            getdb(CATEGORY).insertOne(category, async (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, category });
            })
        })
    },

    getAllCategory(params) {
        let payload = {
            'account_id': ObjectId(params.account_id),
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

    updateCategory(req) {
        let { params, body } = req;
        body.updated_at = new Date();
        body.account_id = ObjectId(body.account_id);
        body.store_id = ObjectId(body.store_id);
        let queryPayload = {
            _id: ObjectId(params.category_id),
            account_id: body.account_id,
            store_id: body.store_id
        }
        return new Promise((resolve, reject) => {
            getdb(CATEGORY).updateOne(queryPayload, { $set: body }, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, body });
            });
        })
    },

    getCategoryById(data) {
        return new Promise((resolve, reject) => {
            let query = [
                {
                    '$match': {
                        '_id': ObjectId(data.params.id),
                        'account_id': ObjectId(data.query.account_id),
                        'store_id': ObjectId(data.query.store_id)
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
                account_id: ObjectId(query.account_id),
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