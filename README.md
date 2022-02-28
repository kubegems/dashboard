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

## 项目框架说明

```sh
├── src
│ ├── api `接口`
│ │ ├── logs `模块接口文件夹`
│ ├── components `全局共享组件`
│ ├── layouts `全局布局`
│ ├── plugins
│ │ ├── vuetify.js `vuetify配置`
│ ├── router `前端路由`
│ │ ├── logs `模块路由文件夹`
│ ├── scss
│ │ ├── variables.scss `全局样式变量`
│ ├── store `全局缓存`
│ ├── utils `工具类`
│ ├── views `视图`
│ │ ├── logs `模块文件夹`
│ ├── app.vue
│ ├── main.js `程序入口`
├── .env `环境变量`
```

# 应用商店开启本地调试

确认添加本地配置文件

cat .env.local

NODE_ENV=development
VUE_APP_APP_STORE_LOCAL_TEST=true
