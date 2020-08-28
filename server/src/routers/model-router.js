import express from 'express';
import fs from 'fs';

let ModelRouter = express.Router();

ModelRouter.get('/gundam.glb', (req, res) => {

	fs.readFile('src/static-assets/gundam.glb', (err, data) => {
		if (err) throw err;
		res.writeHead(200, {
			'Content-Type': 'binary',
			'Content-disposition': 'attachment;filename=gundam.glb',
			'Content-Length': data.length
		});
		res.end(Buffer.from(data), 'binary');
	});
});

ModelRouter.get('/skybox.jpg', (req, res) => {

	fs.readFile('src/static-assets/skybox.jpg', (err, data) => {
		if (err) throw err;
		res.writeHead(200, {
			'Content-Type': 'image/jpeg',
			'Content-disposition': 'attachment;filename=skybox.jpg',
			'Content-Length': data.length
		});
		res.end(Buffer.from(data), 'binary');
	});
});

ModelRouter.get('/building.jpg', (req, res) => {

	fs.readFile('src/static-assets/building.jpg', (err, data) => {
		if (err) throw err;
		res.writeHead(200, {
			'Content-Type': 'image/jpeg',
			// 'Content-disposition': 'attachment;filename=building.jpg',
			// 'Content-Length': data.length
		});
		res.end(Buffer.from(data), 'binary');
	});
});

export {ModelRouter};