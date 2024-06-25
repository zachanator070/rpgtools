# node version 16.17.0 breaks cypress version 10.6.0, using node 16.14.0 for now
FROM node:16-slim as base

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

WORKDIR /opt/rpgtools
RUN chmod o+rw /opt/rpgtools

ADD  package.json .
ADD  package-lock.json .

RUN mkdir -p /opt/rpgtools/packages/common

WORKDIR /opt/rpgtools/packages/common
ADD  packages/common/package.json package.json
ADD  packages/common/tsconfig.json tsconfig.json

RUN mkdir -p /opt/rpgtools/packages/server

WORKDIR /opt/rpgtools/packages/server
ADD  packages/server/package.json package.json
ADD  packages/server/tsconfig.json tsconfig.json

WORKDIR /opt/rpgtools
RUN npm ci

ADD  packages/common/src packages/common/src
ADD  packages/server/src packages/server/src

RUN mkdir /opt/rpgtools/db
RUN chmod o+rw /opt/rpgtools/db

EXPOSE 3000

CMD ["npm", "run", "--workspace=packages/server", "dev:start"]

FROM base as prod
ADD  packages/server/dist packages/server/dist
ADD  packages/frontend/dist packages/frontend/dist

CMD ["npm", "run", "--workspace=packages/server", "start"]
