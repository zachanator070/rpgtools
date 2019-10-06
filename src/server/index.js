import express from 'express';
import bodyParser from "body-parser";
import gqlServer from './gql-server';
const server = express();

server.use(express.static('dist'));

server.use(bodyParser.json());

// Endpoint to check if the API is running
server.get('/api/healthcheck', (req, res) => {
    res.send({ status: 'ok' });
});

const port = process.env['PORT'] || 3000;

gqlServer.applyMiddleware({app: server, path: '/api'});

server.listen(port, () => {
    console.log(`The server is running and listening at http://localhost:${port}`);
});
