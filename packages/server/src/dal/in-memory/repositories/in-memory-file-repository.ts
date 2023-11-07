import { AbstractInMemoryRepository } from "./abstract-in-memory-repository";
import { File } from "../../../domain-entities/file";
import {FileRepository} from "../../repository/file-repository";

export class InMemoryFileRepository
	extends AbstractInMemoryRepository<File>
	implements FileRepository {

	async findByContent(searchTerms: string[]): Promise<File[]> {
		// this is crazy inefficient but mongodb doesn't support text searching file contents as far as I can tell
		const results: File[] = [];
		const allFiles = await this.findAll();
		for(let file of allFiles) {
			for(let term of searchTerms) {
				const containsTerm = await new Promise((resolve, reject) => {
					const bufferQueue: Buffer[] = [];
					let returnValue = false;
					file.readStream.on('data', (data) => {
						bufferQueue.push(data.toString());
						if(bufferQueue.length > 3) {
							bufferQueue.shift();
							const currentValue = bufferQueue.join();
							if(currentValue.includes(term)) {
								returnValue = true;
								file.readStream.destroy();
							}
						}
					});
					file.readStream.on('error', (err) => reject(err));
					file.readStream.on('end', () => { resolve(returnValue) });
				});
				if(containsTerm) {
					results.push(file);
				}
			}

		}

		return results;
	}
}
