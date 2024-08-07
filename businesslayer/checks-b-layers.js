const { USER_SECURE_DATA, CHECKS } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const {redisClient} = require('../database/redish');
const { ObjectId } = require('mongodb');

module.exports = { 
    createCheck(data){
        data.created_at = new Date();
        data.updated_at = new Date();
        data.store_id = ObjectId(data.store_id);
        return new Promise(async(resolve,reject)=>{
            redisClient.publish("checks_data",JSON.stringify(data));
            if(data.status == "CLOSED" || data.status == "VOID"){
                getdb(CHECKS).insertOne(data,async (err,result)=>{
                    if(err){
                        return reject(err);
                    }
                    return resolve({success:true,data});
                })
            }else{
                await redisClient.rPush("checks_info",JSON.stringify(data));
                return resolve({success:true,data});
            }
        })
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
                    created_at: {
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
            let res_data = c_data.filter(d=> d.store_id ==store_id && new Date(d.created_at).getTime() > new Date(start_date).getTime() && new Date(d.created_at).getTime() < new Date(end_date).getTime() )
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
  
