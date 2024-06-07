const { MENUITEMS } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    createMenuitem(menuitem) {
        menuitem.created_at = new Date();
        menuitem.updated_at = new Date();
        menuitem.account_id = ObjectId(menuitem.account_id);
        menuitem.store_id = ObjectId(menuitem.store_id);
        menuitem.category_id = ObjectId(menuitem.category_id);
        return new Promise((resolve, reject) => {
            getdb(MENUITEMS).insertOne(menuitem, async (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:menuitem });
            })
        })
    },

    getAllMenuitems(params) {
        let menuitemPayload = {
            'account_id': ObjectId(params.account_id),
            'store_id': ObjectId(params.store_id)
        }
        return new Promise((resolve, reject) => {
            getdb(MENUITEMS).find(menuitemPayload).toArray()
                .then((result) => {
                    resolve({ success: true, result });
                })
                .catch((err) => {
                    console.error("Error fetching all menuitems:", err);
                    reject(err);
                });
        });
    },

    updateMenuitems(menuitemRequest) {
        let { params, body } = menuitemRequest;
        body.updated_at = new Date();
        body.account_id = ObjectId(body.account_id);
        body.store_id = ObjectId(body.store_id);
        let queryPayload = {
            _id: ObjectId(params.menuitem_id),
            account_id: body.account_id,
            store_id: body.store_id
                }
        return new Promise((resolve, reject) => {
            getdb(MENUITEMS).updateOne(queryPayload, { $set: body }, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:body });
            });
        })
    },

    getMenuitemsById(data) {
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
            getdb(MENUITEMS).aggregate(query).toArray((err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result });
            });
        })
    },

    deleteMenuitemsById(req) {
        let { params, query } = req;
        return new Promise((resolve, reject) => {
            let queryPayload = {
                _id: ObjectId(params.menuitem_id),
                account_id: ObjectId(query.account_id),
                store_id: ObjectId(query.store_id)
            }
            getdb(MENUITEMS).deleteOne(queryPayload, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result: `Deleted menuitem successfully` });
            });
        });
    }

}