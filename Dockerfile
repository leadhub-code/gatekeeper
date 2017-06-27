FROM node:boron

MAINTAINER Petr Messner

RUN mkdir /app
WORKDIR /app

ENV NODE_ENV production

COPY package.json yarn.lock /app/
RUN yarn install

COPY . /app/
RUN yarn run build

EXPOSE 3000

CMD ["yarn", "start"]
