# node version 16.17.0 breaks cypress version 10.6.0, using node 16.14.0 for now
FROM node:16.17.0-slim

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

RUN mkdir /opt/rpgtools
RUN chown node:node /opt/rpgtools

USER node

WORKDIR /opt/rpgtools
ADD --chown=node:node package.json .
ADD --chown=node:node package-lock.json .

RUN mkdir -p /opt/rpgtools/packages/common

WORKDIR /opt/rpgtools/packages/common
ADD --chown=node:node packages/common/package.json package.json

RUN mkdir -p /opt/rpgtools/packages/server

WORKDIR /opt/rpgtools/packages/server
ADD --chown=node:node packages/server/package.json package.json
ADD --chown=node:node packages/server/tsconfig.json tsconfig.json

WORKDIR /opt/rpgtools
RUN npm ci

ADD --chown=node:node packages/common/src packages/common/src

ADD --chown=node:node packages/server/dist packages/server/dist
ADD --chown=node:node packages/frontend/dist packages/server/dist/frontend

RUN mkdir /opt/rpgtools/db
RUN chmod o+rw /opt/rpgtools/db

EXPOSE 3000

CMD ["npm", "run", "--workspace=packages/server", "start"]