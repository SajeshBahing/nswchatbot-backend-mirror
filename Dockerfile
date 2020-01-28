FROM node:13.2.0

WORKDIR /usr/src/app

COPY package.json /usr/src/app
COPY package-lock.json /usr/src/app

RUN npm install
RUN npm install -g nodemon

COPY . /usr/src/app

EXPOSE 3000 8000
CMD [ "nodemon", "-r", "@babel/register", "entry.js" ]
#some comments
#some more comments
