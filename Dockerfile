#image base
FROM node:20-alpine3.17
#copy aplication file
ENV NPM_CONFIG_LOGLEVEL info

COPY my_fetch /home/node/app/my_fetch
WORKDIR /home/node/app/my_fetch

RUN npm install -g