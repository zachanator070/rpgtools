FROM node:current

WORKDIR /home/node/app
ADD package.json package.json
ADD webpack.config.js webpack.config.js
ADD webpack-dev.config.js webpack-dev.config.js
RUN npm install