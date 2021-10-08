FROM node:16.0.0-slim AS base

WORKDIR /home/node/app

ADD package.json .
ADD package-lock.json .

ADD packages/common/package.json packages/common/package.json
ADD packages/frontend/package.json packages/frontend/package.json
ADD packages/server/package.json packages/server/package.json

ADD packages/common packages/common
ADD packages/frontend packages/frontend
ADD packages/server packages/server

RUN npm install

FROM base AS builder
ADD packages/frontend packages/frontend
CMD ["npm", "run", "start", "--workspace=frontend"]

FROM base AS server
ADD packages/server packages/server
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace=server"]
