FROM node:16-slim

RUN mkdir /opt/rpgtools
RUN chown node:node /opt/rpgtools

WORKDIR /opt/rpgtools

ENV HOME="/home/node"