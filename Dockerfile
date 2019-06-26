FROM node:8.15-alpine

COPY ./ /root/app
WORKDIR /root/app

RUN npm i

CMD ["npm", "run", "start"]