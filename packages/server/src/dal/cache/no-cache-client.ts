import {Cache} from "../../types";
import {Readable, Writable} from "stream";
import {injectable} from "inversify";
import * as Stream from "stream";

@injectable()
export class NoCacheClient implements Cache{
    async delete(key: string): Promise<void> {
    }

    async exists(key: string): Promise<boolean> {
        return false;
    }

    async get(key: string): Promise<string | null> {
        return null;
    }

    readStream(key: string): Readable {
        return Readable.from('');
    }

    async set(key: string, value: string, timeout: number | undefined): Promise<void> {
    }

    writeStream(value: string, timeout: number): Writable {
        return new Stream.PassThrough();
    }

}