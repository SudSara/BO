const { GIFTCARD } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {

    async createGiftCard(giftCard) {
        try {
            // Set timestamps
            giftCard.store_id = ObjectId(giftCard.store_id);
    
            // Check if a gift card with the same number already exists for the same store
            const existingGiftCard = await new Promise((resolve, reject) => {
                getdb(GIFTCARD).findOne({
                    giftCardNumber: giftCard.giftCardNumber,
                    store_id: giftCard.store_id
                }, (err, existingGiftCard) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(existingGiftCard);
                    }
                });
            });
    
            if (existingGiftCard) {
                // Gift card exists, update it
                giftCard.updated_at = new Date();
                giftCard.created_at = existingGiftCard.created_at; // Preserve original creation date
                const result = await new Promise((resolve, reject) => {
                    getdb(GIFTCARD).updateOne(
                        { _id: existingGiftCard._id },
                        { $set: giftCard },
                        (err, result) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(result);
                            }
                        }
                    );
                });
    
                return { success: true, message: 'Gift card updated successfully', result: giftCard };
    
            } else {
                // Gift card does not exist, create a new one
                giftCard.created_at = new Date(); // Set creation date for new gift card
                const result = await new Promise((resolve, reject) => {
                    getdb(GIFTCARD).insertOne(giftCard, (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                });
    
                return { success: true, message: 'Gift card created successfully', result: giftCard };
            }
    
        } catch (error) {
            console.error('Error creating or updating gift card:', error);
            throw error;
        }
    },    

    getAllGiftCards(params) {
        return new Promise((resolve, reject) => {
            getdb(GIFTCARD).find({'store_id': ObjectId(params.store_id)}).toArray()
                .then((result) => {
                    resolve({ success: true, result });
                })
                .catch((err) => {
                    console.error("Error fetching all giftCards:", err);
                    reject(err);
                });
        });
    },

    getGiftCardsById(data) {
        return new Promise((resolve, reject) => {
            let query = [
                {
                    '$match': {
                        'giftCardNumber': data.giftCardNumber,
                        'store_id' : ObjectId(data.store_id)
                    }
                }
            ]
            getdb(GIFTCARD).aggregate(query).toArray((err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ success: true, result });
            });
        })
    },

}