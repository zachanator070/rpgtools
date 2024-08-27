FROM node:16-slim

RUN mkdir /opt/rpgtools
RUN chown node:node /opt/rpgtools

USER node

WORKDIR /opt/rpgtools
