import express from 'express';
import bodyParser from "body-parser";
import gqlServer from './gql-server';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';
import {seedDefaultRoles} from "./default-role-seeder";
import path from 'path';
import {ImageRouter} from "./routers/image-router";

const mongodb_host = process.env.MONGODB_HOST || "mongodb";
const mongodb_db_name = process.env.MONGODB_DB_NAME || "rpgtools";
mongoose.connect(`mongodb://${mongodb_host}/${mongodb_db_name}`, {useNewUrlParser: true}).then(
	async () => {
		console.log(`Connected to mongodb at mongodb://${mongodb_host}/${mongodb_db_name}`);
		await seedDefaultRoles();
});

const server = express();

server.use(express.static('dist'));

server.use('/images', ImageRouter);

server.get('/ui*', (req, res) => {
	res.sendFile(path.resolve(__dirname, '../../dist', 'index.html'));
});

server.use(bodyParser.json());
server.use(morgan('tiny'));

server.use(cookieParser());

gqlServer.applyMiddleware({app: server, path: '/api'});

const port = process.env['PORT'] || 3000;

server.listen(port, () => {
	console.log(`The server is running and listening at http://localhost:${port}`);
});
