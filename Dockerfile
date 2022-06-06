FROM nginx:alpine as ui
LABEL MAINTAINER="kubegems"
WORKDIR /usr/src/app

ENV MESSAGE_SERVER=kubegems-msgbus API_SERVER=kubegems-api

COPY dist dist
COPY md dist/md
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template

CMD ["nginx", "-g", "daemon off;"]
