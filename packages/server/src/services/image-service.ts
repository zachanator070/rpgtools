import {
	ChunkFactory,
	FileFactory,
	ImageFactory,
	UnitOfWork,
} from "../types";
import { Image } from "../domain-entities/image";
import { File } from "../domain-entities/file";
import { Chunk } from "../domain-entities/chunk";
import Jimp from "jimp";
import { Readable } from "stream";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../di/injectable-types";

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
		unitOfWork: UnitOfWork
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
		const newImage = this.imageFactory(
			{
				_id: null,
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

		await unitOfWork.imageRepository.create(newImage);
		if (!chunkify) {
			const chunk = await this.createChunk(
				0,
				0,
				image.bitmap.height,
				image.bitmap.width,
				image,
				newImage,
				unitOfWork
			);
			newImage.chunks.push(chunk._id);
			newImage.chunkHeight = 1;
			newImage.chunkWidth = 1;
		} else {
			await this.createChunkRecurse(0, 0, image, newImage, unitOfWork);
			newImage.chunkHeight = Math.ceil(image.bitmap.height / this.chunkSize);
			newImage.chunkWidth = Math.ceil(image.bitmap.width / this.chunkSize);
		}
		await this.makeIcon(image, newImage, unitOfWork);
		await unitOfWork.imageRepository.update(newImage);
		return newImage;
	};

	public deleteImage = async (image: Image, unitOfWork: UnitOfWork): Promise<void> => {
		console.log(`deleting image ${image._id}`);
		for (let chunkId of image.chunks) {
			const chunk: Chunk = await unitOfWork.chunkRepository.findOneById(chunkId);
			const file: File = await unitOfWork.fileRepository.findOneById(chunk.fileId);
			await unitOfWork.fileRepository.delete(file);
			await unitOfWork.chunkRepository.delete(chunk);
		}
		if (image.icon) {
			const icon = await unitOfWork.imageRepository.findOneById(image.icon);
			await this.deleteImage(icon, unitOfWork);
		}
		await unitOfWork.imageRepository.delete(image);
	};

	private makeIcon(jimpImage: Jimp, newImage: Image, unitOfWork: UnitOfWork) {
		return new Promise((resolve, reject) => {
			Jimp.read(jimpImage)
				.then(async (image) => {
					const iconImage = this.imageFactory(
						{
							_id: null,
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
							await unitOfWork.imageRepository.create(iconImage);
							const iconChunk = await this.createChunk(
								0,
								0,
								scaledImage.bitmap.height,
								scaledImage.bitmap.width,
								scaledImage,
								iconImage,
								unitOfWork
							);
							iconImage.chunks = [iconChunk._id];
							newImage.icon = iconImage._id;
							await unitOfWork.imageRepository.update(iconImage);
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
		unitOfWork: UnitOfWork
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
			const chunk = await this.createChunk(x, y, height, width, image, parentImage, unitOfWork);
			parentImage.chunks.push(chunk._id);
			await this.createChunkRecurse(x + 1, y, image, parentImage, unitOfWork);
		} else if (yOk) {
			await this.createChunkRecurse(0, y + 1, image, parentImage, unitOfWork);
		}
	}

	private createChunk = async (
		x: number,
		y: number,
		height: number,
		width: number,
		jimpImage: Jimp,
		parentImage: Image,
		unitOfWork: UnitOfWork
	): Promise<Chunk> => {
		return new Promise((resolve) => {
			Jimp.read(jimpImage).then(async (copy) => {
				copy.crop(x * this.chunkSize, y * this.chunkSize, width, height);
				const newFilename = `${parentImage._id}.chunk.${x}.${y}.${jimpImage.getExtension()}`;
				const buffer: Buffer = await copy.getBufferAsync(jimpImage.getMIME());
				const stream = Readable.from(buffer);
				const file = this.fileFactory({_id: null, filename: newFilename, readStream: stream, mimeType: jimpImage.getMIME()});
				await unitOfWork.fileRepository.create(file);
				const chunk = this.chunkFactory({_id: null, x, y, width, height, fileId: file._id, image: parentImage._id});
				await unitOfWork.chunkRepository.create(chunk);
				resolve(chunk);
			});
		});
	};
}
