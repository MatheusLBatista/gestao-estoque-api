FROM node:22

EXPOSE 5011

WORKDIR /node-app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN cp .env.example .env

ENTRYPOINT ["npm", "start"] 