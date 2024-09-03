FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

COPY .env.docker ./.env

RUN npx prisma generate

RUN npm run build

EXPOSE 3000
EXPOSE 3001

CMD ["npm", "run", "start"]