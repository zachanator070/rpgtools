import {createClient, RedisClientType} from "redis";
import { promisify } from "util";
import { Cache } from "../../types";
import { Readable, Writable } from "stream";
import * as redisRStream from "redis-rstream";
import * as redisWStream from "redis-wstream";
import { injectable } from "inversify";

@injectable()
export class RedisClient implements Cache {
	client: RedisClientType;
	DEFAULT_TIMEOUT = 360;

	constructor() {
		if (!process.env.REDIS_URL) {
			throw new Error("REDIS_URL not set! Unable to connect to redis");
		}
		this.client = createClient({
			url: process.env.REDIS_URL,
		});
		this.client.on("connect", () => {
			console.log(`Connected to ${process.env.REDIS_URL}`);
		});
		this.client.on("error", (error: string) => {
			console.log(`Error while connecting to ${process.env.REDIS_URL}: ${error}`);
		});
		this.client.connect().then(() => {
			console.log("Connected to redis");
		});
	}

	readStream(key: string): Readable {
		return redisRStream(this.client, key);
	}

	writeStream(key: string, timeout: number): Writable {
		return redisWStream(this.client, key, { timeout });
	}

	delete(key: string): Promise<void> {
		return promisify(this.client.get).bind(this.client)(key);
	}

	exists(key: string): Promise<boolean> {
		return promisify(this.client.get).bind(this.client)(key);
	}

	get(key: string): Promise<string | null> {
		return promisify(this.client.get).bind(this.client)(key);
	}

	set(key: string, value: string, timeout: number = this.DEFAULT_TIMEOUT): Promise<void> {
		return promisify(this.client.get).bind(this.client)(key, value, timeout);
	}
}
