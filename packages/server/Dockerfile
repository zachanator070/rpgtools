FROM node:16.0.0-slim

WORKDIR /home/node/app/packages

ADD package.json ../package.json

WORKDIR /home/node/app/packages/common
ADD packages/common/package.json package.json
ADD packages/common/package-lock.json package-lock.json
RUN npm install

WORKDIR /home/node/app/packages/server
ADD packages/server/package.json package.json
ADD packages/server/package-lock.json package-lock.json
RUN npm install -g kill-port
RUN npm install

ADD packages/common/src ../common/src
ADD packages/server/src src

EXPOSE 3000

CMD ["npm", "run", "start"]