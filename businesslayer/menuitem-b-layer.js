const { MENUITEMS } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');
const xlsx = require('xlsx');

module.exports = {

    createMenuitem(menuitem) {
        menuitem.created_at = new Date();
        menuitem.updated_at = new Date();
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
        body.store_id = ObjectId(body.store_id);
        let queryPayload = {
            _id: ObjectId(params.menuitem_id),
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
                        '_id': ObjectId(data.params.id)
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
                _id: ObjectId(params.menuitem_id)
            }
            getdb(MENUITEMS).deleteOne(queryPayload, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result: `Deleted menuitem successfully` });
            });
        });
    },

    async readExcelAndUpdateDB(filePath) {
        try {
            const workbook = xlsx.readFile(filePath);
            const sheet_name_list = workbook.SheetNames;
            const xlData = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            const newRecords = [];
            const existingRecords = [];
            for (let i = 0; i < xlData.length; i++) {
                const data = xlData[i];
                // Check if name already exists in the database
                const existingDoc = await getdb(MENUITEMS).findOne({ name: data.name,store_id:ObjectId(data.store_id) });
    
                if (existingDoc) {
                    // Name exists, prepare response with existing document details
                    existingRecords.push({
                        message: `'${data.name}' Menu item is aready exists!...`,
                        existingRecord: existingDoc
                    });
                } else {
                    // Name does not exist, proceed with update
                    const query = { name: data.name,store_id:ObjectId(data.store_id) }; // Replace with your unique identifier
                    const updateDoc = { 
                        $set: {
                        applicablePeriod:data.applicablePeriod || "",
                        level: data.level || "",
                        category_id: data.category_id || "",
                        color: data.color || "",
                        cost_type: data.cost_type || "",
                        description: data.description || "",
                        imageUrl: data.imageUrl || "",
                        measureType: data.measureType || "",
                        name: data.name || "",
                        prices: JSON.parse(data.prices) || "",
                        secondary_name: data.secondary_name || "",
                        skuCode: data.skuCode || "",
                        sub_category_id: data.sub_category_id || "",
                        taxes: JSON.parse(data.taxes) || "",
                        store_id: ObjectId(data.store_id) || ""
                    } };
                    // Update one document
                    const result = await getdb(MENUITEMS).updateOne(query, updateDoc, { upsert: true });
    
                    newRecords.push({
                        message: `'${data.name}' Menu Item uploaded successfully.`
                    });
                }
            }
    
            return { success: true, responses: {newRecords,existingRecords} };
        } catch (err) {
            console.error('Error updating documents', err);
            throw err; // Propagate error for handling in API endpoint
        }
    }   
}