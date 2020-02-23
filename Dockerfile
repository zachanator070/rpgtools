FROM node:12.16.1

WORKDIR /home/node/app
ADD package.json package.json
ADD package-lock.json package-lock.json
RUN npm install

ADD dist dist
ADD src src
EXPOSE 3000
CMD ["npm", "run", "start"]
