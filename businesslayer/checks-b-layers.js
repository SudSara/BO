const { USER_SECURE_DATA, CHECKS } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const {redisClient} = require('../database/redish');
const { ObjectId } = require('mongodb');

module.exports = { 
    async createCheck(data) {
        // Initialize the data fields
        data.created_at = new Date();
        data.updated_at = new Date();
        data.store_id = ObjectId(data.store_id);
        try {
            // Publish data to Redis
            redisClient.publish("checks_data", JSON.stringify(data));
            
            // Define query payload based on the provided data
            const queryPayload = {
                id: data.id, // Assuming _id is used to find the existing check
                store_id: data.store_id
            };
            if (data.status !== "ACTIVE") {
                // Check if the check exists
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
    
                    if (updateResult.matchedCount === 0) {
                        return { success: false, result: 'Failed to update check' };
                    }
    
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
    
                if (!checkExists) {
                    return { success: false, result: 'Checks not found' };
                }
    
                // Proceed to delete the check
                const deleteResult = await new Promise((resolve, reject) => {
                    getdb(CHECKS).deleteOne(queryPayload, (err, result) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve(result);
                    });
                });
    
                if (deleteResult.deletedCount === 0) {
                    return { success: false, result: 'Failed to delete check' };
                }
    
                // Push data to Redis
                await redisClient.rPush("checks_info", JSON.stringify(data));
    
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
            checkPayloadDetail.status = body.status;
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
    async getCheckById(checks){
        let { params} = checks;
        queryPayload = {
            '_id': ObjectId(params.id),
        }
        return new Promise((resolve,reject)=>{
            getdb(CHECKS).findOne(queryPayload,async (err,result)=>{
                if(err){
                    return reject(err);
                }
                return resolve({success:true,result : result || {} });
            });
        })
    },
    
    getCheckByDateRange(body){
        let { start_date, end_date, store_id, status } = body;
        start_date = start_date ? parseDateFromString(start_date) : new Date();
        end_date = end_date ? parseDateFromString(end_date) : new Date();
        start_date.setHours(0, 0, 0, 0);
        end_date.setHours(23, 59, 59, 999);
        
        const query = [
            {
                $match: {
                    business_date: {
                        $gte: start_date,
                        $lte: end_date,
                    },
                    'store_id': ObjectId(store_id)
                }
            }
        ];
        return new Promise(async(resolve,reject)=>{
            getdb(CHECKS).aggregate(query).toArray((err,result)=>{
                if(err){
                    return reject(err);
                }
                return resolve({success:true,result});
            });
        })
    },
    async getCheckByDateRangewithactive(body){
        return new Promise(async(resolve,reject)=>{ 
            let { start_date, end_date, store_id, status } = body;
            start_date = start_date ? parseDateFromString(start_date) : new Date();
            end_date = end_date ? parseDateFromString(end_date) : new Date();
            start_date.setHours(0, 0, 0, 0);
            end_date.setHours(23, 59, 59, 999);
            
            let data = await redisClient.lRange("checks_info", 0, -1);
            let c_data = JSON.parse(`[${data}]`);
            let res_data = c_data.filter(d=> d.store_id == store_id && new Date(d.business_date).getTime() > new Date(start_date).getTime() && new Date(d.business_date).getTime() < new Date(end_date).getTime() )
            resolve({success:true,result:res_data})
        })
 
        // return new Promise(async(resolve,reject)=>{
        //     getdb(CHECKS).aggregate(query).toArray((err,result)=>{
        //         if(err){
        //             return reject(err);
        //         }
        //         return resolve({success:true,result});
        //     });
        // })
    }
}

function parseDateFromString(dateString) {
    const parts = dateString.split('-');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; 
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day,0,0,0,0);
}
  
