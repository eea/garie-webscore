FROM node:12.14-stretch

WORKDIR /app
COPY . .
RUN npm install

ENV NODE_ENV=production
CMD npm run app
