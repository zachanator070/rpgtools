import express from 'express';
import bodyParser from "body-parser";
import gqlServer from './gql-server';
import cookieParser from 'cookie-parser';

import mongoose from 'mongoose';

const mongodb_host = process.env.MONGODB_HOST || "mongodb";
const mongodb_db_name = process.env.MONGODB_DB_NAME || "rpgtools";
mongoose.connect(`mongodb://${mongodb_host}/${mongodb_db_name}`, { useNewUrlParser: true }).then(() => console.log('connected to mongodb'));

const server = express();

server.use(express.static('dist'));

server.use(bodyParser.json());

server.use(cookieParser());

const port = process.env['PORT'] || 3000;

gqlServer.applyMiddleware({app: server, path: '/api'});

server.listen(port, () => {
    console.log(`The server is running and listening at http://localhost:${port}`);
});
