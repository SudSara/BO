const redis = require("redis");
console.log(process.env.RDB_URL)
const client  = redis.createClient({url:'redis://default:Suda67pos56g@18.188.146.151:6379'});

//{ url: process.env.RDB_URL}

const initRdb =  async() => {
    await client.connect(); 
}

client.on('ready', () => {
    console.log("Redish Connected!");
});

client.on('error', err => console.log('Redis Client Error', err))
client.on('end', () => {
   console.log('Redis connection ended');
})

module.exports = {initRdb};

