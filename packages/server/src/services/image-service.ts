import { Image } from "../domain-entities/image.js";
import { File } from "../domain-entities/file.js";
import { Chunk } from "../domain-entities/chunk.js";
import Jimp from "jimp";
import { Readable } from "stream";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types.js";
import {DatabaseContext} from "../dal/database-context.js";
import ImageFactory from "../domain-entities/factory/image-factory.js";
import ChunkFactory from "../domain-entities/factory/chunk-factory.js";
import FileFactory from "../domain-entities/factory/file-factory.js";

@injectable()
export class ImageService {
	chunkSize = 250;

	@inject(INJECTABLE_TYPES.ImageFactory)
	imageFactory: ImageFactory;
	@inject(INJECTABLE_TYPES.ChunkFactory)
	chunkFactory: ChunkFactory;
	@inject(INJECTABLE_TYPES.FileFactory)
	fileFactory: FileFactory;

	createImage = async (
		worldId: string,
		chunkify: boolean,
		filename: string,
		readStream: Readable,
		databaseContext: DatabaseContext
	) => {
		// @TODO need to check a permission here
		if (chunkify === null) {
			chunkify = true;
		}

		const rawData: any[] = await new Promise((resolve, reject) => {
			const rawData: any[] = [];
			readStream.on("data", (data) => {
				rawData.push(data);
			});
			readStream.on("end", () => {
				resolve(rawData);
			});
			readStream.on("error", (err) => {
				reject(err);
			});
		});

		const image = await Jimp.read(Buffer.concat(rawData));
		const newImage = this.imageFactory.build(
			{
				name: filename,
				world: worldId,
				width: image.bitmap.width,
				height: image.bitmap.height,
				chunkWidth: 0,
				chunkHeight: 0,
				chunks: [],
				icon: null
			}
		);

		await databaseContext.imageRepository.create(newImage);
		if (!chunkify) {
			const chunk = await this.createChunk(
				0,
				0,
				image.bitmap.height,
				image.bitmap.width,
				image,
				newImage,
				databaseContext
			);
			newImage.chunks.push(chunk._id);
			newImage.chunkHeight = 1;
			newImage.chunkWidth = 1;
		} else {
			await this.createChunkRecurse(0, 0, image, newImage, databaseContext);
			newImage.chunkHeight = Math.ceil(image.bitmap.height / this.chunkSize);
			newImage.chunkWidth = Math.ceil(image.bitmap.width / this.chunkSize);
		}
		await this.makeIcon(image, newImage, databaseContext);
		await databaseContext.imageRepository.update(newImage);
		return newImage;
	};

	public deleteImage = async (image: Image, databaseContext: DatabaseContext): Promise<void> => {
		console.log(`deleting image ${image._id}`);
		for (const chunkId of image.chunks) {
			const chunk: Chunk = await databaseContext.chunkRepository.findOneById(chunkId);
			const file: File = await databaseContext.fileRepository.findOneById(chunk.fileId);
			await databaseContext.fileRepository.delete(file);
			await databaseContext.chunkRepository.delete(chunk);
		}
		if (image.icon) {
			const icon = await databaseContext.imageRepository.findOneById(image.icon);
			await this.deleteImage(icon, databaseContext);
		}
		await databaseContext.imageRepository.delete(image);
	};

	private makeIcon(jimpImage: Jimp, newImage: Image, databaseContext: DatabaseContext) {
		return new Promise((resolve, reject) => {
			Jimp.read(jimpImage)
				.then(async (image) => {
					const iconImage = this.imageFactory.build(
						{
							name: "icon." +newImage.name,
							world: newImage.world,
							width: this.chunkSize,
							height: this.chunkSize,
							chunkHeight: 1,
							chunkWidth: 1,
							chunks: [],
							icon: null
						}
					);
					image.scaleToFit(this.chunkSize, this.chunkSize, (err, scaledImage) => {
						(async () => {
							await databaseContext.imageRepository.create(iconImage);
							const iconChunk = await this.createChunk(
								0,
								0,
								scaledImage.bitmap.height,
								scaledImage.bitmap.width,
								scaledImage,
								iconImage,
								databaseContext
							);
							iconImage.chunks = [iconChunk._id];
							newImage.icon = iconImage._id;
							await databaseContext.imageRepository.update(iconImage);
							resolve(iconImage);
						})();
					});
				})
				.catch((err) => {
					return reject(err);
				});
		});
	}

	private async createChunkRecurse(
		x: number,
		y: number,
		image: Jimp,
		parentImage: Image,
		databaseContext: DatabaseContext
	) {
		const xOk = image.bitmap.width - x * this.chunkSize > 0;
		const yOk = image.bitmap.height - y * this.chunkSize > 0;
		let width = this.chunkSize;
		let height = this.chunkSize;
		if (x * this.chunkSize + width > image.bitmap.width) {
			width = image.bitmap.width - x * this.chunkSize;
		}
		if (y * this.chunkSize + height > image.bitmap.height) {
			height = image.bitmap.height - y * this.chunkSize;
		}
		if (!yOk) {
			return;
		}
		if (xOk) {
			const chunk = await this.createChunk(x, y, height, width, image, parentImage, databaseContext);
			parentImage.chunks.push(chunk._id);
			await this.createChunkRecurse(x + 1, y, image, parentImage, databaseContext);
		} else if (yOk) {
			await this.createChunkRecurse(0, y + 1, image, parentImage, databaseContext);
		}
	}

	private createChunk = async (
		x: number,
		y: number,
		height: number,
		width: number,
		jimpImage: Jimp,
		parentImage: Image,
		databaseContext: DatabaseContext
	): Promise<Chunk> => {
		return new Promise((resolve) => {
			Jimp.read(jimpImage).then(async (copy) => {
				copy.crop(x * this.chunkSize, y * this.chunkSize, width, height);
				const newFilename = `${parentImage._id}.chunk.${x}.${y}.${jimpImage.getExtension()}`;
				const buffer: Buffer = await copy.getBufferAsync(jimpImage.getMIME());
				const stream = Readable.from(buffer);
				const file = this.fileFactory.build({filename: newFilename, readStream: stream, mimeType: jimpImage.getMIME()});
				await databaseContext.fileRepository.create(file);
				const chunk = this.chunkFactory.build({x, y, width, height, fileId: file._id, image: parentImage._id});
				await databaseContext.chunkRepository.create(chunk);
				resolve(chunk);
			});
		});
	};
}
