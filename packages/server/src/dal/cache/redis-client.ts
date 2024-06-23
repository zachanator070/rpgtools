import {createClient, RedisClientType} from "redis";
import { Cache } from "../../types";
import { Readable, Writable, Duplex } from "stream";
import { injectable } from "inversify";
import { Buffer } from "buffer";

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
		this.client.on("error", (error: string) => {
			console.log(`Error while connecting to ${process.env.REDIS_URL}: ${error}`);
		});
		this.client.connect().then(() => {
			console.log(`Connected to ${process.env.REDIS_URL}`);
		});
	}

	readStream(key: string): Readable {
		return Readable.from([this.client.get(key)]);
	}

	writeStream(key: string, timeout: number): Writable {
		let readIndex = 0;
		let chunks: Buffer = Buffer.alloc(0);
		const cacheWrite = async () => {
			// return this.client.set(key, chunks.toString(), {EX: timeout});
		}
		return new Duplex({
			write(chunk: any, encoding: BufferEncoding, callback: (error?: (Error | null)) => void) {
				chunks = Buffer.concat([chunks, chunk], chunks.length + chunk.length);
				callback();
			},
			final(callback: (error?: (Error | null)) => void) {
				cacheWrite().then(() => {
					callback();
				});
			},
			read(size: number) {
				if (readIndex >= chunks.length) {
					this.push(null);
					return;

				}
				const chunk = chunks.subarray(readIndex, readIndex + size);
				this.push(chunk);
				readIndex += size;
			}
		});
	}

	async delete(key: string): Promise<void> {
		await this.client.get(key);
	}

	async exists(key: string): Promise<boolean> {
		return await this.client.exists(key) === 1;
	}

	async get(key: string): Promise<string | null> {
		return await this.client.get(key);
	}

	async set(key: string, value: string, timeout: number = this.DEFAULT_TIMEOUT): Promise<void> {
		await this.client.set(key, value, {EX: timeout});
	}
}
