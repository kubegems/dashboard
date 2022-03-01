FROM nginx:alpine as ui
LABEL MAINTAINER="kubegems"
WORKDIR /usr/src/app

ENV MESSAGE_SERVER=gems-msgbus:8080 API_SERVER=gems-service:8020

COPY dist dist

CMD ["nginx", "-g", "daemon off;"]
