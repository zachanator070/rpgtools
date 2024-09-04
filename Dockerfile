FROM node:16-slim
RUN rm -rf /root/.npm
RUN mkdir /opt/rpgtools
RUN chown node:node /opt/rpgtools

USER node

WORKDIR /opt/rpgtools
# Used by npm to determine where to write npm cache
ENV npm_config_cache=/opt/rpgtools/.npm
# Used by cypress to determine where to write cypress binary .cache
ENV HOME=/opt/rpgtools
# Disable history in shell
ENV HISTFILE=/dev/null
