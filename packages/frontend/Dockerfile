FROM node:16.17.0-slim

WORKDIR /home/node/app

ADD package.json .
ADD package-lock.json .

WORKDIR /home/node/app/packages/common
ADD packages/common/package.json package.json

WORKDIR /home/node/app/packages/frontend
ADD packages/frontend/package.json package.json

WORKDIR /home/node/app
RUN npm install

ADD packages/common/tsconfig.json packages/common/tsconfig.json
ADD packages/frontend/tsconfig.json packages/frontend/tsconfig.json

WORKDIR /home/node/app/packages/frontend
ADD packages/frontend/webpack.config.js webpack.config.js
ADD packages/frontend/webpack-dev.config.js webpack-dev.config.js
RUN mkdir -p dist
RUN chmod o+rw dist

WORKDIR /home/node/app
ADD packages/common/src packages/common/src
ADD packages/frontend/src packages/frontend/src

CMD ["npm", "run", "-w", "packages/frontend", "start"]