FROM nginx:alpine as ui
LABEL MAINTAINER="kubegems"
WORKDIR /usr/src/app

ENV MESSAGE_SERVER=10.12.96.186 API_SERVER=10.12.96.186:30939

COPY dist dist
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template

CMD ["nginx", "-g", "daemon off;"]
