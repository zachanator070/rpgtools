FROM node:16.0.0-slim

WORKDIR /home/node/app/packages

ADD package.json ../package.json

WORKDIR /home/node/app/packages/common
ADD packages/common/package.json package.json
ADD packages/common/package-lock.json package-lock.json
RUN npm install

WORKDIR /home/node/app/packages/frontend
ADD packages/frontend/package.json package.json
ADD packages/frontend/package-lock.json package-lock.json
RUN npm install

ADD packages/frontend/webpack.config.js webpack.config.js
ADD packages/frontend/webpack-dev.config.js webpack-dev.config.js

RUN mkdir -p dist
RUN chmod o+w dist

ADD packages/common/src ../common/src
ADD packages/frontend/src src

ADD packages/common/tsconfig.json ../common/tsconfig.json
ADD packages/frontend/tsconfig.json .

CMD ["npm", "run", "start"]