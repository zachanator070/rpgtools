
import mongoose from 'mongoose';
import {Image} from '../../models/image';
import {Chunk} from '../../models/chunk';
import {GridFSBucket} from "mongodb";
import Jimp from 'jimp';

const chunkSize = 250;

async function createChunkRecurse(x, y, image, parentImage){
	const xOk = image.bitmap.width - x * chunkSize > 0;
	const yOk = image.bitmap.height - y * chunkSize > 0;
	let width = chunkSize;
	let height = chunkSize;
	if(x * chunkSize + width > image.bitmap.width){
		width = image.bitmap.width - x * chunkSize;
	}
	if(y * chunkSize + height > image.bitmap.height){
		height = image.bitmap.height - y * chunkSize;
	}
	if(!yOk){
		return;
	}
	if(xOk) {
		await createChunk(x, y, height, width, image, parentImage);
		await createChunkRecurse(x + 1, y , image, parentImage);
	} else if(yOk) {
		await createChunkRecurse(0, y + 1 , image, parentImage);
	}
}

function createChunk(x, y, height, width, image, parentImage){
	return new Promise((resolve, reject) => {
		const gfs = new GridFSBucket(mongoose.connection.db);

		Jimp.read(image).then((copy) => {
			copy.crop( x * chunkSize, y * chunkSize, width, height);
			const newFilename = `${parentImage._id}.chunk.${x}.${y}.${image.getExtension()}`;
			const writeStream = gfs.openUploadStream(
				newFilename,
				{contentType: image.getMIME()}
			);

			writeStream.on('finish', (file) => {

				Chunk.create({
					x: x,
					y: y,
					width: width,
					height: height,
					fileId: file._id,
					image: parentImage._id
				}, (err, chunk) => {
					Image.findOneAndUpdate({_id: parentImage._id}, {$push: {chunks: chunk._id}}, {new: true}, (err) => {
						resolve();
						if(err){
							reject(err);
							throw err;
						}
					});
				});
			});


			writeStream.on('error', (err) => {
				reject(err);
				throw err;
			});
			copy.getBuffer(image.getMIME(), (err, buffer) => {
				writeStream.end(buffer);
			});
		});
	});
}

function makeIcon(jimpImage, newImage) {
	return new Promise((resolve, reject) => {
		Image.findOne({_id: newImage._id}, (err, foundImage) => {
			if(err){
				return reject(err);
			}
			if(!foundImage){
				return reject(new Error('Root image not found'));
			}
			const gfs = new GridFSBucket(mongoose.connection.db);

			Jimp.read(jimpImage)
				.then(image => {

					image.scaleToFit(chunkSize, chunkSize, (err, scaledImage) => {
						const newFilename = `${newImage._id}.chunk.0.0.${jimpImage.getExtension()}`;
						const writeStream = gfs.openUploadStream(
							newFilename,
							{contentType: jimpImage.getMIME()}
						);

						const iconSchema = {
							name: 'icon.' + newImage.name,
							chunkList: [],
							world: newImage.world._id,
							chunkHeight: 1,
							chunkWidth: 1,
							width: scaledImage.bitmap.width,
							height: scaledImage.bitmap.height
						};

						writeStream.on('finish', (file) => {
							Image.create(iconSchema, (err, iconImage) => {
								if (err) {
									return reject(err);
								}
								Chunk.create({
									x: 0,
									y: 0,
									width: scaledImage.bitmap.width,
									height: scaledImage.bitmap.height,
									fileId: file._id,
									image: iconImage._id
								}, (err, chunk) => {
									if (err) {
										return reject(err);
									}
									iconImage.chunks = [chunk._id];
									iconImage.save((err) => {
										if (err) {
											return reject(err);
										}
										foundImage.icon = iconImage._id;
										foundImage.save((err) => {
											if (err) {
												return reject(err);
											}
											resolve(newImage);
										});
									});
								});
							});
						});
						writeStream.on('error', function (err) {
							return reject(err);
						});
						scaledImage.getBuffer(jimpImage.getMIME(), (err, buffer) => {
							writeStream.end(buffer);
						});
					});
				}).catch(err => {
				return reject(err);
			});
		});
	});
}

export const imageMutations = {
	createImage: async (_, {file, worldId, chunkify}) => {
		// @TODO need to check a permission here
		if(chunkify === null){
			chunkify = true;
		}
		file = await file;
		const stream = file.createReadStream();

		const rawData = await new Promise((resolve, reject) => {
			const rawData = [];
			stream.on('data', (data) => {
				rawData.push(data);
			});
			stream.on('end', () => {
				resolve(rawData);
			});
			stream.on('error', (err) => {
				reject(err);
			})
		});

		const image = await Jimp.read(Buffer.concat(rawData));
		const newImage = await Image.create({
			name: file.filename,
			chunkList: [],
			world: worldId,
			width: image.bitmap.width,
			height: image.bitmap.height
		});


		if(!chunkify){
			await createChunk(0, 0, image.bitmap.height, image.bitmap.width, image, newImage);
			newImage.chunkHeight = 1;
			newImage.chunkWidth = 1;
		}
		else {
			await createChunkRecurse(0, 0, image, newImage);
			newImage.chunkHeight = Math.ceil(image.bitmap.height/chunkSize);
			newImage.chunkWidth = Math.ceil(image.bitmap.width/chunkSize);
		}
		await newImage.save();
		await makeIcon(image, newImage);
		return newImage;
	}
};