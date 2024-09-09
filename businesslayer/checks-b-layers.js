const { CHECKS } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { redisClient } = require('../database/redish');
const { ObjectId } = require('mongodb');

module.exports = {
    async createCheck(data) {
        // Initialize the data fields
        data.created_at = new Date();
        data.updated_at = new Date();
        data.store_id = ObjectId(data.store_id);
        data.status = data.status.toLowerCase();
        try {
            // Publish data to Redis
            redisClient.publish("checks_data", JSON.stringify(data));

            // Define query payload based on the provided data
            const queryPayload = {
                id: data.id, // Assuming _id is used to find the existing check
                store_id: data.store_id
            };
            if (data.status !== "active") {
                // Check if the check exists
                await redisUpdate(true,data);
                const checkExists = await new Promise((resolve, reject) => {
                    getdb(CHECKS).findOne(queryPayload, (err, document) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve(document);
                    });
                });

                if (checkExists) {
                    // Update the existing check
                    const updateResult = await new Promise((resolve, reject) => {
                        getdb(CHECKS).updateOne(queryPayload, { $set: data }, (err, result) => {
                            if (err) {
                                return reject(err);
                            }
                            resolve(result);
                        });
                    });
                    return { success: true, data };
                } else {
                    // Insert the new check if it does not exist
                    const insertResult = await new Promise((resolve, reject) => {
                        getdb(CHECKS).insertOne(data, (err, result) => {
                            if (err) {
                                return reject(err);
                            }
                            resolve(result);
                        });
                    });

                    if (!insertResult.insertedId) {
                        return { success: false, result: 'Failed to insert check' };
                    }

                    return { success: true, data };
                }
            } else {
                // Handle the ACTIVE status case
                // Check if the check exists before deletion
                const checkExists = await new Promise((resolve, reject) => {
                    getdb(CHECKS).findOne(queryPayload, (err, document) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve(document);
                    });
                });

                // Proceed to delete the check
                const deleteResult = await new Promise((resolve, reject) => {
                    getdb(CHECKS).deleteOne(queryPayload, (err, result) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve(result);
                    });
                });
                await redisUpdate(false,data);
                // Push data to Redis
                // await redisClient.del("checks_info");

                return { success: true, data };
            }
        } catch (error) {
            return { success: false, result: error.message };
        }
    },

    getAllChecks(payloadDetail) {
        let { params, body } = payloadDetail;
        let checkPayloadDetail = {};
        if (params.store_id) {
            checkPayloadDetail.store_id = ObjectId(params.store_id);
        }
        if (body.status) {
            checkPayloadDetail.status = body.status.toLowerCase();
        }
        if (body.business_date) {
            checkPayloadDetail.business_date = body.business_date;
        }
        return new Promise((resolve, reject) => {
            getdb(CHECKS).find(checkPayloadDetail).toArray()
                .then((result) => {
                    resolve({ success: true, result });
                })
                .catch((err) => {
                    console.error("Error fetching all categories:", err);
                    reject(err);
                });
        });
    },
    async getCheckById(checks) {
        let { params } = checks;
        queryPayload = {
            '_id': ObjectId(params.id),
        }
        return new Promise((resolve, reject) => {
            getdb(CHECKS).findOne(queryPayload, async (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result: result || {} });
            });
        })
    },

    getCheckByDateRange(body) {
        let { business_date, store_id } = body;

        const query = [
            {
                $match: {
                    'store_id': ObjectId(store_id),
                    'business_date': business_date
                }
            }
        ];
        return new Promise(async (resolve, reject) => {
            getdb(CHECKS).aggregate(query).toArray((err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result });
            });
        })
    },
    async getCheckByDateRangewithactive(body) {
        return new Promise(async (resolve, reject) => {
            let { business_date, store_id } = body;
            let data = await redisClient.lRange("checks_info", 0, -1);
            let c_data = JSON.parse(`[${data}]`);
            let res_data = c_data.filter(d => d.store_id == store_id && (d.business_date === business_date))
            resolve({ success: true, result: res_data })
        })
    }
}

async function redisUpdate(isDelete, data) {
    try {
        // Fetch the entire list from Redis
        const existingCheckDetails = await redisClient.lRange('checks_info', 0, -1);

        // Parse existing data only once
        const existingChecks = existingCheckDetails.map(check => JSON.parse(check));
        
        // Create a map for quick ID lookups
        const checkMap = new Map(existingChecks.map(check => [check.id, check]));

        if (isDelete) {
            // Remove the item with the specified ID
            checkMap.delete(data.id);
        } else {
            // Update or add the new data
            checkMap.set(data.id, data);
        }

        // Convert the updated map back to an array of JSON strings
        const updatedList = Array.from(checkMap.values()).map(item => JSON.stringify(item));

        // Overwrite the entire list in Redis
        await redisClient.del('checks_info'); // Clear the old list
        if (updatedList.length > 0) {
            await redisClient.rPush('checks_info', updatedList); // Push the updated list
        }

        console.log('List updated successfully');
    } catch (error) {
        console.error('Error updating the list:', error);
    }
}



