# node version 16.17.0 breaks cypress version 10.6.0, using node 16.14.0 for now
FROM node:16.17.0-slim

WORKDIR /opt/rpgtools
ADD package.json .
ADD package-lock.json .

WORKDIR /opt/rpgtools/packages/common
ADD packages/common/package.json package.json
ADD packages/common/tsconfig.json tsconfig.json

WORKDIR /opt/rpgtools/packages/server
ADD packages/server/package.json package.json
ADD packages/server/tsconfig.json tsconfig.json

WORKDIR /opt/rpgtools
RUN npm ci

ADD packages/common/src packages/common/src
ADD packages/server/src packages/server/src

ADD packages/frontend/dist packages/server/dist/frontend

RUN mkdir /opt/rpgtools/db
RUN chmod o+rw /opt/rpgtools/db

EXPOSE 3000

CMD ["npm", "run", "--workspace=packages/server", "start"]