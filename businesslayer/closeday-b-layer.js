const { CLOSEDAY } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    createCloseDay(closeDay) {
        closeDay.created_at = new Date();
        closeDay.updated_at = new Date();
        closeDay.store_id = ObjectId(closeDay.store_id);
        return new Promise((resolve, reject) => {
            getdb(CLOSEDAY).insertOne(closeDay, async (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:closeDay });
            })
        })
    },

    getAllCloseDay(closeDayPayloadDetail) {
        let { params, body } = closeDayPayloadDetail;
        let closeDayQueryPayload = {};
        if (params.store_id) {
            closeDayQueryPayload.store_id = ObjectId(params.store_id);
        }
        return new Promise((resolve, reject) => {
            getdb(CLOSEDAY).find(closeDayQueryPayload).toArray((err,result) => {
                    if(err){
                        reject(err)
                    }
                    resolve({success:true,result})
                })
        });
    },

    updateCloseDay(closeDayRequest) {
        let { params, body } = closeDayRequest;
        body.updated_at = new Date();
        body.store_id = ObjectId(body.store_id);
        let queryPayload = {
            _id: ObjectId(params.closeDay_id)
        }
        return new Promise((resolve, reject) => {
            getdb(CLOSEDAY).updateOne(queryPayload, { $set: body }, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result:body });
            });
        })
    }

}