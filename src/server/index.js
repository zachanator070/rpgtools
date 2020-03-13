import express from 'express';
import bodyParser from "body-parser";
import gqlServer from './gql-server';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';
import {defaultSeeders} from "./default-seeders";
import path from 'path';
import {ImageRouter} from "./routers/image-router";
import {checkConfig, serverNeedsSetup} from './server-needs-setup'

const mongodb_host = process.env.MONGODB_HOST || "mongodb";
const mongodb_db_name = process.env.MONGODB_DB_NAME || "rpgtools";
mongoose.connect(`mongodb://${mongodb_host}/${mongodb_db_name}`, {useNewUrlParser: true}).then(
	async () => {
		console.log(`Connected to mongodb at mongodb://${mongodb_host}/${mongodb_db_name}`);
		await defaultSeeders();
		await createServer();
	}
);

const createServer = async () => {
	const server = express();

	await checkConfig();

	server.get('*.js', function (req, res, next) {
		req.url = req.url + '.gz';
		res.set('Content-Encoding', 'gzip');
		next();
	});
	server.get('*.css', function (req, res, next) {
		req.url = req.url + '.gz';
		console.log(req.url);
		res.set('Content-Encoding', 'gzip');
		res.set('Content-Type', 'text/css');
		next();
	});

	server.use('/images', ImageRouter);

	server.get('*', (req, res, next) => {
		const needsSetup = serverNeedsSetup();
		if(needsSetup){
			if (['/api', '/ui/setup', '/app.bundle.js'].includes(req.url)){
				return next();
			}
			return res.redirect(302, '/ui/setup');
		}
		else {
			return next();
		}
	});

	server.get('/ui*', (req, res) => {
		return res.sendFile(path.resolve(__dirname, '../../dist', 'index.html'));
	});

	server.use(express.static('dist'));

	server.use(bodyParser.json());
	server.use(morgan('tiny'));

	server.use(cookieParser());

	gqlServer.applyMiddleware({app: server, path: '/api'});

	const port = process.env.SERVER_PORT || 3000;

	server.listen(port, () => {
		console.log(`The server is running and listening at http://localhost:${port}`);
	});

};