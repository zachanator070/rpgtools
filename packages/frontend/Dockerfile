FROM node:14.11.0-slim

WORKDIR /home/node/app/packages

RUN npm install -g lerna
ADD lerna.json ../lerna.json
ADD package.json ../package.json

ADD packages/common/package.json common/package.json
ADD packages/common/package-lock.json common/package-lock.json

WORKDIR /home/node/app/packages/frontend

ADD packages/frontend/package.json package.json
ADD packages/frontend/package-lock.json package-lock.json
ADD packages/frontend/webpack.config.js webpack.config.js
ADD packages/frontend/webpack-dev.config.js webpack-dev.config.js

RUN lerna bootstrap

RUN mkdir -p dist
RUN chmod o+w dist

ADD packages/common/src ../common/src
ADD packages/frontend/src src

CMD ["npm", "run", "start"]