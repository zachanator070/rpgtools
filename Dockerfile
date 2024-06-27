FROM node:16-slim

RUN mkdir /opt/rpgtools
RUN chown node:node /opt/rpgtools

WORKDIR /opt/rpgtools

USER node

ENV HOME="/home/node"