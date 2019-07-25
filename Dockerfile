FROM registry.29tech.cn/ubuntu-ffmpeg-nodejs-sox

COPY ./ /root/app
WORKDIR /root/app

RUN mkdir -p public && npm i

CMD ["npm", "run", "start"]