FROM node:12.16.1-slim

WORKDIR /home/node/app
ADD src/app/package.json package.json
ADD src/app/package-lock.json package-lock.json
RUN npm install
ADD webpack.config.js webpack.config.js
ADD webpack-dev.config.js webpack-dev.config.js

CMD ["npm", "run", "start"]