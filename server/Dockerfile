FROM node:12.16.1-slim

WORKDIR /home/node/app

ADD common/src common/src
ADD common/package.json common/package.json
ADD common/package-lock.json common/package-lock.json
RUN cd common && npm install

WORKDIR /home/node/app/server

ADD server/src src
ADD server/package.json package.json
ADD server/package-lock.json package-lock.json
RUN npm install
RUN npm install -g kill-port

ADD dist ../dist

EXPOSE 3000

CMD ["npm", "run", "start"]