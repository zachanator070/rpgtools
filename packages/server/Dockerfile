FROM node:16.14.0-slim

WORKDIR /home/node/app
ADD package.json .
ADD package-lock.json .

WORKDIR /home/node/app/packages/common
ADD packages/common/package.json package.json
ADD packages/common/tsconfig.json tsconfig.json

WORKDIR /home/node/app/packages/server
ADD packages/server/package.json package.json
ADD packages/server/tsconfig.json tsconfig.json

WORKDIR /home/node/app
RUN npm install

ADD packages/common/src packages/common/src
ADD packages/server/src packages/server/src

EXPOSE 3000

CMD ["npm", "run", "--workspace=packages/server", "start"]