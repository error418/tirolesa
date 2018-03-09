FROM node:8.9.4-alpine as build

COPY . /opt/tirolesa/

WORKDIR /opt/tirolesa
RUN npm i && npm run build

FROM node:8.9.4-alpine

COPY --from=build /opt/tirolesa/ /opt/tirolesa/
WORKDIR /opt/tirolesa/
EXPOSE 3000
ENTRYPOINT ["node","server.js"]