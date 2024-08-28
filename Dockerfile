FROM node:16-slim
RUN rm -rf /root/.npm
RUN mkdir /opt/rpgtools
RUN chown node:node /opt/rpgtools

USER node

WORKDIR /opt/rpgtools
