let config ={};
config.sfipfromauthendication = process.env.SKIP_URLS || [];
config.secret_salt = process.env.SECRET_SALT;
config.db_url = process.env.DB_URL;

module.exports = config;