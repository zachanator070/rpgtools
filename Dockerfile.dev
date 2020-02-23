FROM node:current

WORKDIR /home/node/app
ADD package.json package.json
ADD package-lock.json package-lock.json
RUN npm install
RUN npm install -g kill-port
ADD webpack.config.js webpack.config.js
ADD webpack-dev.config.js webpack-dev.config.js
