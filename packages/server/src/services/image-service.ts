import { ApplicationService, ChunkRepository, FileRepository, ImageRepository } from "../types";
import { Image } from "../domain-entities/image";
import { INJECTABLE_TYPES } from "../injectable-types";
import { inject } from "inversify";
import { File } from "../domain-entities/file";
import { Chunk } from "../domain-entities/chunk.";
import Jimp from "jimp";
import { FileUpload } from "graphql-upload";
import { Readable } from "stream";

export class ImageService implements ApplicationService {
	@inject(INJECTABLE_TYPES.ImageRepository)
	imageRepository: ImageRepository;
	@inject(INJECTABLE_TYPES.ChunkRepository)
	chunkRepository: ChunkRepository;
	@inject(INJECTABLE_TYPES.FileRepository)
	fileRepository: FileRepository;

	chunkSize = 250;

	createImage = async (worldId: string, chunkify: boolean, file: FileUpload) => {
		// @TODO need to check a permission here
		if (chunkify === null) {
			chunkify = true;
		}
		file = await file;
		const stream = file.createReadStream();

		const rawData: any[] = await new Promise((resolve, reject) => {
			const rawData: any[] = [];
			stream.on("data", (data) => {
				rawData.push(data);
			});
			stream.on("end", () => {
				resolve(rawData);
			});
			stream.on("error", (err) => {
				reject(err);
			});
		});

		const image = await Jimp.read(Buffer.concat(rawData));
		const newImage = new Image(
			"",
			file.filename,
			worldId,
			image.bitmap.width,
			image.bitmap.height,
			0,
			0,
			[],
			""
		);

		if (!chunkify) {
			const chunk = await this.createChunk(
				0,
				0,
				image.bitmap.height,
				image.bitmap.width,
				image,
				newImage
			);
			newImage.chunks.push(chunk._id);
			newImage.chunkHeight = 1;
			newImage.chunkWidth = 1;
		} else {
			await this.createChunkRecurse(0, 0, image, newImage);
			newImage.chunkHeight = Math.ceil(image.bitmap.height / this.chunkSize);
			newImage.chunkWidth = Math.ceil(image.bitmap.width / this.chunkSize);
		}
		await this.makeIcon(image, newImage);
		await this.imageRepository.create(newImage);
		return newImage;
	};

	async createChunkRecurse(x: number, y: number, image: Jimp, parentImage: Image) {
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
			const chunk = await this.createChunk(x, y, height, width, image, parentImage);
			parentImage.chunks.push(chunk._id);
			await this.createChunkRecurse(x + 1, y, image, parentImage);
		} else if (yOk) {
			await this.createChunkRecurse(0, y + 1, image, parentImage);
		}
	}

	createChunk = async (
		x: number,
		y: number,
		height: number,
		width: number,
		jimpImage: Jimp,
		parentImage: Image
	): Promise<Chunk> => {
		return new Promise((resolve, reject) => {
			Jimp.read(jimpImage).then(async (copy) => {
				copy.crop(x * this.chunkSize, y * this.chunkSize, width, height);
				const newFilename = `${parentImage._id}.chunk.${x}.${y}.${jimpImage.getExtension()}`;
				const buffer: Buffer = await copy.getBufferAsync(jimpImage.getMIME());
				const stream = Readable.from(buffer);
				const file = new File("", newFilename, stream, jimpImage.getMIME());
				await this.fileRepository.create(file);
				const chunk = new Chunk("", x, y, width, height, file._id, parentImage._id);
				resolve(chunk);
			});
		});
	};

	makeIcon(jimpImage: Jimp, newImage: Image) {
		return new Promise(async (resolve, reject) => {
			Jimp.read(jimpImage)
				.then(async (image) => {
					const iconImage = new Image(
						"",
						"icon." + newImage.name,
						newImage.world,
						this.chunkSize,
						this.chunkSize,
						1,
						1,
						[],
						""
					);
					image.scaleToFit(this.chunkSize, this.chunkSize, (err, scaledImage) => {
						(async () => {
							const iconChunk = await this.createChunk(
								0,
								0,
								scaledImage.bitmap.height,
								scaledImage.bitmap.width,
								scaledImage,
								iconImage
							);
							iconImage.chunks = [iconChunk._id];
							await this.imageRepository.create(iconImage);
							newImage.icon = iconImage._id;
							resolve(iconImage);
						})();
					});
				})
				.catch((err) => {
					return reject(err);
				});
		});
	}

	deleteImage = async (image: Image) => {
		console.log(`deleting image ${image._id}`);
		for (let chunkId of image.chunks) {
			const chunk: Chunk = await this.chunkRepository.findById(chunkId);
			const file: File = await this.fileRepository.findById(chunk.fileId);
			await this.fileRepository.delete(file);
			await this.chunkRepository.delete(chunk);
		}
		if (image.icon) {
			const icon = await this.imageRepository.findById(image.icon);
			await this.deleteImage(icon);
		}
		await this.imageRepository.delete(image);
	};
}
