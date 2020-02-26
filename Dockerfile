FROM node:12.14-stretch

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY src ./

ENV NODE_ENV=production
CMD npm run app
