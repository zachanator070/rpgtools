FROM node:16-slim

USER node

RUN mkdir /opt/rpgtools
RUN chown node:node /opt/rpgtools

WORKDIR /opt/rpgtools
