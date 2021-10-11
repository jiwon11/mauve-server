FROM node:12

# Bundle APP files
WORKDIR /tuningApp

COPY . .

RUN npm cache clean --force
RUN npm install -g pm2

# Install app dependencies
RUN npm install

# Expose the listening port of your app
EXPOSE 3000
CMD [ "pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]