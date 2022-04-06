FROM node:10-alpine

WORKDIR /app

COPY build build
COPY node_modules node_modules
# COPY package.json package.json
COPY key.json key.json

RUN ["npm", "rebuild"]

CMD ["node", "build/index.js"]
