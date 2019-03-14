FROM node:boron

MAINTAINER Petr Messner

RUN mkdir /app
WORKDIR /app

ENV NODE_ENV production

COPY package.json package-lock.json /app/
RUN npm install

COPY . /app/
RUN npm run build

RUN useradd --create-home --system --uid 900 app
USER app

EXPOSE 3000

CMD ["node", "server"]
