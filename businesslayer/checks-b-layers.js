const { CHECKS } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { redisClient } = require('../database/redish');
const { ObjectId } = require('mongodb');
const current_date = new Date();
module.exports = {
    async createCheck(data) {
        // Initialize the data fields
        data.updated_at = current_date;
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
                    data.created_at = current_date;
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
        let { params, query } = payloadDetail;
        let checkPayloadDetail = {};
        if (params.store_id) {
            checkPayloadDetail.store_id = ObjectId(params.store_id);
        }
        if (query.status) {
            checkPayloadDetail.status = query.status.toLowerCase();
        }
        if (query.business_date) {
            checkPayloadDetail.business_date = query.business_date;
        }else{
            checkPayloadDetail.business_date = formatDate(current_date)
        }

        const pipeline = [
            {
                $match: checkPayloadDetail
            },
            {
                $addFields: {
                    // Calculate duration in milliseconds from created_at to the current time
                    duration: {
                        $subtract: [new Date(), "$created_at"]
                    }
                }
            },
            {
                $group: {
                    _id: null,  // Grouping by null to get total for all documents
                    totalAmount: { $sum: "$total" },
                    totalCount: { $sum: 1 },  // Counting the number of documents
                    totalDuration: { $sum: "$duration" },  // Summing the durations
                    checks: { $push: "$$ROOT" }  // Collecting all matching documents
                }
            },
            {
                $project: {
                    _id: 0,
                    totalAmount: {
                        $concat: [{ $toString: "$totalAmount" }]
                    },
                    averageAmount: {
                        $cond: {
                            if: { $gt: ["$totalCount", 0] },
                            then: {
                                $concat: [
                                    {
                                        $toString: {
                                            $round: [{ $divide: ["$totalAmount", "$totalCount"] }, 2]
                                        }
                                    }
                                ]
                            },
                            else: 'Rs.0.00'
                        }
                    },
                    averageDuration: {
                        $cond: {
                            if: { $gt: ["$totalCount", 0] },
                            then: {
                                $concat: [
                                    {
                                        $toString: {
                                            $round: [{
                                                $divide: ["$totalDuration", "$totalCount"]
                                            }, 0]
                                        }
                                    },
                                    ' ms'
                                ]
                            },
                            else: '0 ms'
                        }
                    },
                    totalCount: 1,
                    checks: 1
                }
            }
        ];

        return new Promise((resolve, reject) => {
            getdb(CHECKS).aggregate(pipeline).toArray()
                .then((result) => {
                    const averageDurationMs = result.length > 0 ? result[0].averageDuration : 0;
                    const averageDuration = formatDuration(averageDurationMs);
                    const response = {
                        totalAmount: result.length > 0 ? result[0].totalAmount : '0.00',
                        averageAmount: result.length > 0 ? result[0].averageAmount : '0.00',
                        averageDuration,
                        totalCount: result.length > 0 ? result[0].totalCount : 0,
                        checks: result.length > 0 ? result[0].checks : []
                    };
                    resolve({ success: true, result: response});
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

    getCheckByDateRange(checkDetails) {
        let { business_date, store_id } = checkDetails.query;
        const query = [
            {
                $match: {
                    'store_id': ObjectId(store_id),
                    'business_date': business_date || formatDate(current_date)
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
    async getCheckByDateRangewithactive(checkDetails) {
        return new Promise(async (resolve, reject) => {
            let { business_date, store_id } = checkDetails.query;
            let data = await redisClient.lRange("checks_info", 0, -1);
            let c_data = JSON.parse(`[${data}]`);
            let res_data = c_data.filter(d => d.store_id == store_id && (d.business_date === (business_date || formatDate(current_date))))
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

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() returns month from 0-11
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
}
// Function to format duration from milliseconds to "HH hrs MM:SS"
function formatDuration(ms) {
    let num = parseInt(ms);
    const hours = Math.floor(num / 3600000); // Convert milliseconds to hours
    const minutes = Math.floor((num % 3600000) / 60000); // Convert remaining milliseconds to minutes
    const seconds = Math.floor((num % 60000) / 1000); // Convert remaining milliseconds to seconds

    // Format hours, minutes, and seconds to always have two digits
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
}



