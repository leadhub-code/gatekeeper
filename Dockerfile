FROM node:boron

MAINTAINER Petr Messner

RUN mkdir /app
WORKDIR /app

ENV NODE_ENV production

COPY package.json yarn.lock /app/
RUN yarn install

COPY . /app/
RUN yarn run build

RUN useradd --create-home --system --uid 900 app
USER app

EXPOSE 3000

CMD ["node", "server"]
