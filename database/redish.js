
const http = require('http');
const socketIo = require('socket.io');
const redis = require("redis");

const redisClient = redis.createClient({url: 'redis://default:Suda67pos56g@18.188.146.151:6379'});
const subscriberClient = redis.createClient({url: 'redis://default:Suda67pos56g@18.188.146.151:6379'});
const socketApp = http.createServer();
const io = socketIo(socketApp);

redisClient.on('ready', () => {
    console.log("Redis Connected!");
});

redisClient.on('error', err => console.log('Redis Client Error', err));

redisClient.on('end', () => {
   console.log('Redis connection ended');
});

subscriberClient.on('ready', () => {
    console.log("Subscriber Redis Connected!");
});

subscriberClient.on('error', err => console.log('Subscriber Redis Client Error', err));

subscriberClient.on('end', () => {
   console.log('Subscriber Redis connection ended');
});


io.on('connection', (socket) => {
    console.log('New client connected');
    subscriberClient.subscribe('checks_data', (message, channel) => {
        socket.emit('update', message);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const initRdb = async () => {
    try {
        await redisClient.connect();
        await subscriberClient.connect();
    } catch (err) {
        console.error('Error connecting to Redis:', err);
    }
};

const SOCKET_PORT = 8081;
socketApp.listen(SOCKET_PORT, () => console.log(`Socket.IO server running on port ${SOCKET_PORT}`));

module.exports = { initRdb, redisClient, subscriberClient};
