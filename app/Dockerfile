FROM node:14.11.0-slim

WORKDIR /home/node/app

ADD common/package.json common/package.json
ADD common/package-lock.json common/package-lock.json
RUN cd common && npm install

WORKDIR /home/node/app/app

ADD app/package.json package.json
ADD app/package-lock.json package-lock.json
RUN npm install
ADD app/webpack.config.js webpack.config.js
ADD app/webpack-dev.config.js webpack-dev.config.js

RUN mkdir -p dist
RUN chmod o+w dist

ADD common/src ../common/src
ADD app/src src

CMD ["npm", "run", "start"]