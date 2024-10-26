FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install 

COPY . .

EXPOSE 4567

CMD ["npm", "run", "dev"]