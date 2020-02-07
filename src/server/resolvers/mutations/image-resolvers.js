
import mongoose from 'mongoose';
import {Image} from '../../models/image';
import {Chunk} from '../../models/chunk';
import Grid from 'gridfs-stream';
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
		const gfs = Grid(mongoose.connection.db, mongoose.mongo);

		console.time(`createChunk.${parentImage._id}.${x}.${y}`);
		Jimp.read(image).then((copy) => {
			copy.crop( x * chunkSize, y * chunkSize, width, height);
			const newFilename = `chunk.${x}.${y}.${parentImage.name}`;
			const writeStream = gfs.createWriteStream({
				filename: newFilename,
				content_type: image.getMIME()
			});

			writeStream.on('close', (file) => {

				Chunk.create({
					x: x,
					y: y,
					width: width,
					height: height,
					fileId: file._id,
					image: parentImage._id
				}, (err, chunk) => {
					Image.findOneAndUpdate({_id: parentImage._id}, {$push: {chunks: chunk._id}}, {new: true}, (err, image) => {
						console.timeEnd(`createChunk.${parentImage._id}.${x}.${y}`);
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

function makeIcon(req, newImageId) {
	return new Promise((resolve, reject) => {
		Image.findOne({_id: newImageId}, (err, foundImage) => {
			if(err){
				return reject(err);
			}
			if(!foundImage){
				return reject(new Error('Root image not found'));
			}
			const gfs = Grid(mongoose.connection.db, mongoose.mongo);

			Jimp.read(req.files.data.data)
				.then(image => {

					image.scaleToFit(chunkSize, chunkSize, (err, scaledImage) => {
						const newFilename = `chunk.0.0.${req.files.data.name}`;
						const writeStream = gfs.createWriteStream({
							filename: newFilename,
							content_type: req.files.data.mimetype
						});

						const newImageSchema = {
							name: 'icon.' + req.files.data.name,
							chunkList: [],
							world: req.user.currentWorld,
							chunkHeight: 1,
							chunkWidth: 1,
							width: scaledImage.bitmap.width,
							height: scaledImage.bitmap.height
						};

						writeStream.on('close', (file) => {
							Image.create(newImageSchema, (err, newImage) => {
								if (err) {
									return reject(err);
								}
								Chunk.create({
									x: 0,
									y: 0,
									width: scaledImage.bitmap.width,
									height: scaledImage.bitmap.height,
									fileId: file._id,
									image: newImage._id
								}, (err, chunk) => {
									if (err) {
										return reject(err);
									}
									newImage.chunks = [chunk._id];
									newImage.save((err) => {
										if (err) {
											return reject(err);
										}
										foundImage.icon = newImage._id;
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
						scaledImage.getBuffer(Jimp.AUTO, (err, buffer) => {
							writeStream.end(buffer);
						});
					});
				}).catch(err => {
				return reject(err);
			});
		});
	});
}

export const imageResolvers = {
	createImage: async (parent, {file, worldId, chunkify}, {currentUser}) => {
		if(chunkify === null){
			chunkify = true;
		}
		console.time('jimp read image');
		const image = await Jimp.read(file.stream);

		const newImage = await Image.create({
			name: file.filename,
			chunkList: [],
			world: worldId,
			width: image.bitmap.width,
			height: image.bitmap.height
		});

		console.timeEnd('jimp read image');

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
		await makeIcon(req, newImage._id);
		return newImage;
	}
};