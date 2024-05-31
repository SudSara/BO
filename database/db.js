/* eslint-disable implicit-arrow-linebreak */
const { MongoClient } = require('mongodb');
let db;
const initDb = () =>
  new Promise((resolve, reject) => {
    console.log(process.env.DB_URL,"process.env.DB_URL")
    MongoClient.connect(process.env.DB_URL, {}, (err, database) => {
      if (err) return reject(err);
      db = database.db("pos-billing");
      console.log('Database Connected');
      return resolve();
    });
  });
const getDb = (collectionToGet) => db.collection(collectionToGet);
module.exports = {
  initDb,
  getDb,
};
