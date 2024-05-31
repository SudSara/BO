const getdb = require('../database/db').getDb;
const { ObjectID } = require('mongodb');
const { USERS, USER_SECURE_DATA } = require('../helper/collection-name');

module.exports = {
  checkUserExist: (body) =>
    new Promise((resolve, reject) => {
    getdb(USERS).findOne({ user_name: body.user_name }, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  }),
  getSecureInfo: (user_id) =>
    new Promise((resolve, reject) => {
    getdb(USER_SECURE_DATA).findOne(
      { user_id: ObjectID(user_id) },
      (err, result) => {
        if (err) {
          return reject();
        }
        return resolve(result);
      },
    );
  }),
};
