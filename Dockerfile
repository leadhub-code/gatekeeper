FROM node:10-buster

RUN mkdir /app
WORKDIR /app

COPY package.json package-lock.json /app/
RUN npm ci

COPY . /app/
RUN npm run build

RUN useradd --create-home --system --uid 900 app
USER app

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "server.dist"]
