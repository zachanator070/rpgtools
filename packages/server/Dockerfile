FROM node:14.11.0-slim

WORKDIR /home/node/app/packages

RUN npm install -g lerna
ADD lerna.json ../lerna.json
ADD package.json ../package.json

ADD packages/common/package.json common/package.json
ADD packages/common/package-lock.json common/package-lock.json

WORKDIR /home/node/app/packages/server

ADD packages/server/package.json package.json
ADD packages/server/package-lock.json package-lock.json
RUN npm install -g kill-port
RUN lerna bootstrap

ADD packages/common/src ../common/src
ADD packages/server/src src
ADD packages/frontend/dist ../dist

EXPOSE 3000

CMD ["npm", "run", "start"]