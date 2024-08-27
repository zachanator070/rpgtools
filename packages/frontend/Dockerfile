FROM node:16-slim

USER node
WORKDIR /opt/rpgtools

ADD package.json .
ADD package-lock.json .

WORKDIR /opt/rpgtools/packages/common
ADD packages/common/package.json package.json

WORKDIR /opt/rpgtools/packages/frontend
ADD packages/frontend/package.json package.json

WORKDIR /opt/rpgtools
RUN npm ci

ADD packages/common/tsconfig.json packages/common/tsconfig.json
ADD packages/frontend/tsconfig.json packages/frontend/tsconfig.json

WORKDIR /opt/rpgtools/packages/frontend
ADD packages/frontend/webpack.config.cjs webpack.config.cjs
RUN mkdir -p dist
RUN chmod o+rw dist

WORKDIR /opt/rpgtools
ADD packages/common/src packages/common/src
ADD packages/frontend/src packages/frontend/src

CMD ["npm", "run", "-w", "packages/frontend", "start"]
