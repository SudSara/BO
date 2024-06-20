const { USER_SECURE_DATA, CHECKS } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = { 
    createCheck(data){
        data.created_at = new Date();
        data.updated_at = new Date();
        data.store_id = ObjectId(data.store_id);
        return new Promise((resolve,reject)=>{
            getdb(CHECKS).insertOne(data,async (err,result)=>{
                if(err){
                    return reject(err);
                }
                return resolve({success:true,data});
            })
        })
    },
    getCheckById(params){
        return new Promise((resolve,reject)=>{
            getdb(CHECKS).findOne({'_id': ObjectId(params.id)},async (err,result)=>{
                if(err){
                    return reject(err);
                }
                return resolve({success:true,result});
            });
        })
    },
    getCheckByDateRange(body){
        let { start_date, end_date } = body;

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
                    }
                }
            }
        ];
        return new Promise((resolve,reject)=>{
            getdb(CHECKS).aggregate(query).toArray((err,result)=>{
                if(err){
                    return reject(err);
                }
                return resolve({success:true,result});
            });
        })
    }
}

function parseDateFromString(dateString) {
    const parts = dateString.split('-');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; 
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day,0,0,0,0);
}
  
