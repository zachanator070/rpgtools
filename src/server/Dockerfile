FROM node:12.16.1

WORKDIR /home/node/app
ADD src/server/package.json package.json
RUN npm install
RUN npm install -g kill-port

ADD dist dist
ADD src src
EXPOSE 3000

CMD ["npm", "run", "start"]