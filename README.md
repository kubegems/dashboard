# 项目运行

## Project setup

```sh
yarn install
```

### Compiles and hot-reloads for development

```sh
yarn run serve
```

### Compiles and minifies for production

```sh
yarn run build
```

### Run your tests

```sh
yarn run test
```

### Lints and fixes files

```sh
yarn run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

## build

```sh
make build
make docker
make push
make deploy
```

## 运行

运行时需要指定环境变量 `NGINX_UPSTREAM` 为后端服务地址，默认为`server`。

详见[nginx.conf.template](./nginx.conf.template)
