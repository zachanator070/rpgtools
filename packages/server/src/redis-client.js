import redis from "redis";
import { promisify } from "util";
import redisStreams from "redis-streams";
redisStreams(redis);

let client = process.env.REDIS_URL
  ? redis.createClient(process.env.REDIS_URL, {
      return_buffers: true,
    })
  : null;

if (client) {
  client.on("connect", () => {
    console.log(`Connected to ${process.env.REDIS_URL}`);
  });
  client.on("error", (error) => {
    console.log(`Error while connecting to ${process.env.REDIS_URL}: ${error}`);
  });
}

export const redisClient = client;

export const getAsync = client ? promisify(client.get).bind(client) : () => {};
export const setAsync = client ? promisify(client.set).bind(client) : () => {};
export const delAsync = client ? promisify(client.del).bind(client) : () => {};
export const existsAsync = client
  ? promisify(client.exists).bind(client)
  : () => {};
