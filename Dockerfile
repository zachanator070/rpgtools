FROM node:24-slim AS base

RUN apt-get update && apt-get upgrade -y && apt-get clean

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

WORKDIR /opt/rpgtools
RUN chown node:node /opt/rpgtools

USER node

EXPOSE 3000

FROM base AS dev

# Used by npm to determine where to write npm cache
ENV npm_config_cache=/opt/rpgtools/.npm
# Used by tooling that writes runtime caches under user home
ENV HOME=/opt/rpgtools

CMD ["npm", "run", "--workspace=packages/server", "dev:start"]

FROM base AS prod

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
ADD  packages/server/branding packages/server/branding

RUN mkdir /opt/rpgtools/db
RUN chmod o+rw /opt/rpgtools/db

ADD  packages/server/dist packages/server/dist

CMD ["npm", "run", "--workspace=packages/server", "start"]
