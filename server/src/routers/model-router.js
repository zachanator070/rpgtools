import express from 'express';
import fs from 'fs';

let ModelRouter = express.Router();

ModelRouter.get('/gundam', (req, res) => {

	fs.readFile('src/routers/scene.glb', (err, data) => {
		if (err) throw err;
		res.writeHead(200, {
			'Content-Type': 'binary',
			'Content-disposition': 'attachment;filename=gundam.glb',
			'Content-Length': data.length
		});
		res.end(Buffer.from(data), 'binary');
	});
});

export {ModelRouter};