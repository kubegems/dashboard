FROM nginx:alpine as ui
LABEL MAINTAINER="kubegems"
WORKDIR /usr/src/app

ENV MESSAGE_SERVER=0.0.0.0:8080 API_SERVER=0.0.0.0:8020

COPY dist dist
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template

CMD ["nginx", "-g", "daemon off;"]
