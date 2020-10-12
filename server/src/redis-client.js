import redis from 'redis';
import redisStreams from 'redis-streams';
redisStreams(redis);

let client = process.env.REDIS_URL ?
    redis.createClient(process.env.REDIS_URL, {
        return_buffers: true
    })
    : null;

if(client){
    client.on('connect', () => {
        console.log(`Connected to ${process.env.REDIS_URL}`);
    });
    client.on('error', () => {
        console.log(`Error while connecting to ${process.env.REDIS_URL}`);
    });
}

export const redisClient = client;