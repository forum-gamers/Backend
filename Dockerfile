FROM node:latest

WORKDIR /usr/local/app

COPY package.json  ./

COPY . /usr/local/app/

ENV NODE_ENV=production

RUN npm install bun nest -g

RUN bun install 

RUN bun run build 

EXPOSE 3001

CMD [ "bun","dist/main.js" ]