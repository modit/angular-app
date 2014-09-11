FROM stackbrew/ubuntu:latest

RUN apt-get update
RUN apt-get install -y wget build-essential python-dev
RUN wget -O - http://nodejs.org/dist/v0.10.25/node-v0.10.25-linux-x64.tar.gz | tar -C /usr/local/ --strip-components=1 -zxv

RUN npm install -g grunt-cli

WORKDIR /data/app/client
ADD client/package.json /data/app/client/package.json
RUN npm install

WORKDIR /data/app/server
ADD server/package.json /data/app/server/package.json
RUN npm install

ADD . /data/app
RUN grunt --base /data/app/client --gruntfile /data/app/client/gruntFile.js build

CMD npm start