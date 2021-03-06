FROM node:14

WORKDIR /app

COPY package* ./

RUN npm install

COPY . /app

CMD ["node", "app.js"]
