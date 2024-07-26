const { MENUITEMS, CATEGORY, TAXES } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');
const xlsx = require('xlsx');

module.exports = {

    async createMenuitem(menuitem) {
        return new Promise((resolve, reject) => {
            try {
                menuitem.created_at = new Date();
                menuitem.updated_at = new Date();
                menuitem.store_id = ObjectId(menuitem.store_id);
                menuitem.category_id = ObjectId(menuitem.category_id);

                // Convert menuitem name to case-insensitive regex pattern
                const nameRegex = new RegExp(`^${menuitem.name}$`, 'i');
                getdb(MENUITEMS).findOne({ name: nameRegex, store_id: menuitem.store_id }, (err, existingDoc) => {
                    if (err) {
                        return reject(err); // Handle error from findOne
                    }
                    
                    if (existingDoc) {
                        // Name exists, prepare response with existing document details
                        return resolve({
                            success: false,
                            message: `'${menuitem.name}' Menu item already exists!`,
                        });
                    } else {
                        getdb(MENUITEMS).insertOne(menuitem, (err, result) => {
                            if (err) {
                                return reject(err); // Handle error from insertOne
                            }
                            return resolve({
                                success: true,
                                result: menuitem
                            });
                        });
                    }
                });
            } catch (error) {
                // Handle any synchronous errors
                console.error('Error in createMenuItem:', error);
                reject(error);
            }
        });
    
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

    async updateMenuitems(menuitemRequest) {
        try {
            let { params, body } = menuitemRequest;
            body.updated_at = new Date();
            body.store_id = ObjectId(body.store_id);
    
            let queryPayload = {
                _id: ObjectId(params.menuitem_id),
            };
    
            // Fetch all menu items for the store
            const allMenuItems = await getdb(MENUITEMS).find({ store_id: body.store_id }).toArray();
    
            // Check if the updated name already exists for another menu item (case-insensitive)
            const existingMenuItem = allMenuItems.find(menuItem =>
                menuItem.name.toLowerCase() === body.name.toLowerCase() &&
                menuItem._id.toString() !== params.menuitem_id
            );
    
            if (existingMenuItem) {
                return {
                    success: false,
                    message: `Menu item with name '${body.name}' already exists for this store.`,
                };
            }
    
            // Update the menu item
            const updateResult = await getdb(MENUITEMS).updateOne(queryPayload, { $set: body });
    
            if (updateResult.modifiedCount === 0) {
                return {
                    success: false,
                    message: `Menu item with ID '${params.menuitem_id}' not found.`,
                }
            }
            return {
                success: true,
                result: body,
            };
        } catch (error) {
            console.error('Error updating menu item:', error);
            throw error; // Re-throw the error to be caught by the caller
        }
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
            const sheetName = workbook.SheetNames[0]; // Assuming you are processing the first sheet
            const xlData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    
            const newRecords = [];
            const existingRecords = [];
            const categoryRecords = [];
            for (let i = 0; i < xlData.length; i++) {
                const data = xlData[i];
    
                // Convert storeId to ObjectId
                const storeId = ObjectId(data.storeId);
    
                // Check if menu item already exists
                const existingDoc = await getdb(MENUITEMS).findOne({ name: data.name, store_id: storeId });
    
                // Check if category exists
                let category_id = "";
                if (data.category) {
                    const getCategory = await getdb(CATEGORY).findOne({ name: data.category, store_id: storeId });
                    console.log(data.category,getCategory)
                    if (getCategory) {
                        category_id = getCategory._id;
                    } else {
                        categoryRecords.push({
                            message: `Category '${data.category}' not found for this store`
                        });
                        // Handle the case where category doesn't exist
                        continue; // Skip processing this record
                    }
                }
    
                // Fetch tax IDs
                let taxIds = [];
                if (data.taxes) {
                    const taxNames = data.taxes.split(',').map(name => name.trim());
                    for (const taxName of taxNames) {
                        const tax = await getdb(TAXES).findOne({ name: taxName });
                        if (tax) {
                            taxIds.push(tax._id);
                        } else {
                            console.log(`Tax '${taxName}' not found in the database`);
                            // Handle the case where tax doesn't exist
                        }
                    }
                }
                // Prepare update document
                const updateDoc = {
                    $set: {
                        applicablePeriod: data.applicablePeriod || 1,
                        level: data.level || "category",
                        category_id: category_id || "",
                        color: data.color || "blue",
                        cost_type: data.costType || "fixed",
                        description: data.description || "",
                        imageUrl: data.imageUrl || "",
                        measureType: data.measureType || "menu item",
                        name: data.name || "",
                        price: Number(data.price),
                        prices: [],
                        secondary_name: data.secondaryName || "",
                        skuCode: data.skuCode || "",
                        sub_category_id: data.subCategoryId || "",
                        taxes: taxIds || [],
                        timeEvents: data.timeEvents || 1,
                        store_id: storeId,
                        created_at: new Date(),
                        updated_at: new Date(),
                        included:[],
                        optional:[],
                        mandatory:[]
                    }
                };
    
                if (existingDoc) {
                    // Menu item exists, push to existing records
                    existingRecords.push({
                        message: `'${data.name}' Menu item already exists!`,
                        existingRecord: existingDoc
                    });
                } else {
                    // Menu item does not exist, proceed with update or insert
                    const query = { name: data.name, store_id: storeId };
    
                    const result = await getdb(MENUITEMS).updateOne(query, updateDoc, { upsert: true });
    
                    if (result.upsertedCount > 0) {
                        newRecords.push({
                            message: `'${data.name}' Menu Item uploaded successfully.`
                        });
                    } else {
                        console.log(`Failed to upsert '${data.name}' Menu Item.`);
                        // Handle failure to upsert
                    }
                }
            }
    
            return { success: true, result: { newRecords, existingRecords, categoryRecords } };
        } catch (err) {
            console.error('Error updating documents:', err);
            throw err; // Propagate error for handling in API endpoint or further up the call stack
        }
    }  
}