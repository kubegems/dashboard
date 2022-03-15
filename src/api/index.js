import axios from 'axios'
import router from '@/router'
import store from '@/store'
import { validateJWT } from '@/utils/helpers'

axios.defaults.baseURL = `${window.location.origin}/api/v1`
axios.defaults.timeout = 1000 * parseInt(process.env.VUE_APP_API_TIMEOUT)

axios.interceptors.request.use(function (config) {
  if (
    !validateJWT(store.state.JWT) &&
    [
      '/login',
      '/403',
      '/404',
      '/white/page',
      '/white/tenant',
      '/whitecluster/cluster',
    ].indexOf(window.location.pathname) === -1 &&
    !window.location.pathname.startsWith('/oauth/callback/')
  ) {
    store.commit('CLEARALL')
    window.localStorage.clear()
    router.push({
      name: 'login',
      query: {
        redirect: `${window.location.pathname}${window.location.search}`,
      },
    })
    store.commit('SET_SNACKBAR', {
      text: 'token过期，请重新登录',
      color: 'error',
    })
    return new Promise(() => { })
  }
  if (
    new RegExp('undefined|//', 'g').test(config.url) ||
    (config.method.toLowerCase() === 'get' &&
      config.params &&
      Object.values(config.params).indexOf(undefined) > -1) ||
    (config.method.toLowerCase() in ['post', 'patch', 'put', 'delete'] &&
      config.data &&
      Object.values(config.data).indexOf(undefined) > -1)
  ) {
    console.log(config)
    store.commit('SET_SNACKBAR', {
      text: '请求参数有误',
      color: 'error',
    })
    return new Promise(() => { })
  }
  if (
    config.method.toLowerCase() === 'get' &&
    config.url.indexOf('callback') === -1
  ) {
    if (!(config.params && config.params.noprocessing)) {
      store.commit('SET_PROGRESS', true)
    }
  } else if (
    ['post', 'patch', 'put', 'delete'].indexOf(config.method.toLowerCase()) > -1
  ) {
    store.commit('SET_CIRCULAR', true)
  }
  if (store.state.Csrftoken) {
    config.headers['X-CSRFToken'] = store.state.Csrftoken
  }
  if (store.state.JWT) {
    config.headers.Authorization = `Bearer ${store.state.JWT}`
  }
  if (config.method.toLowerCase() in ['post', 'patch', 'put', 'delete']) {
    config.headers['Content-type'] = 'application/json;charset=utf-8'
  }
  return config
})
axios.interceptors.response.use(
  function (response) {
    if (
      !(
        response &&
        response.config &&
        response.config.params &&
        response.config.params.noprocessing
      )
    ) {
      store.commit('SET_PROGRESS', false)
    }
    if ([200, 201, 204].indexOf(response.status) > -1) {
      if (
        ['put', 'post', 'patch', 'delete'].indexOf(response.config.method) > -1
      ) {
        store.commit('SET_CIRCULAR', false)
        if (['cluster/validate-kubeconfig', 'logqueryhistory'].indexOf(response.config.url) === -1) {
          store.commit('SET_SNACKBAR', {
            text: '操作成功',
            color: 'success',
          })
        }
      }
      return response.data.Data
    } else {
      store.commit('SET_PROGRESS', false)
      store.commit('SET_CIRCULAR', false)
      store.commit('SET_SNACKBAR', {
        text: response.data.Message,
        color: 'warning',
      })
    }
  },
  function (error) {
    store.commit('SET_PROGRESS', false)
    store.commit('SET_CIRCULAR', false)
    // 方便排查
    console.log(error)
    if (!(error && error.response)) {
      if (error.toString().indexOf('timeout') > -1) {
        store.commit('SET_SNACKBAR', {
          text: '请求超时',
          color: 'error',
        })
      } else {
        store.commit('SET_SNACKBAR', {
          text: error,
          color: 'error',
        })
      }
    } else {
      switch (error.response.status) {
        case 400:
          store.commit('SET_SNACKBAR', {
            text:
              typeof error.response.data.ErrorData === 'string'
                ? error.response.data.ErrorData
                : error.response.data.Message,
            color: 'error',
          })
          break
        case 401:
          store.commit('SET_SNACKBAR', {
            text: '认证失败，请登录后访问',
            color: 'warning',
          })
          store.commit('CLEARALL')
          if ([
            '/login',
            '/403',
            '/404',
            '/white/page',
            '/white/tenant',
            '/whitecluster/cluster',
          ].indexOf(window.location.pathname) === -1) {
            router.push({
              name: 'login',
              query: {
                redirect: `${window.location.pathname}${window.location.search}`,
              },
            })
          }
          if (window.location.pathname.startsWith('/oauth/callback/')) {
            router.push({
              name: 'login',
            })
          }
          break
        case 403:
          store.commit('SET_SNACKBAR', {
            text: '无权限获取该数据',
            color: 'warning',
          })
          break
        case 404:
          store.commit('SET_SNACKBAR', {
            text: '请求资源不存在',
            color: 'warning',
          })
          break
        case 405:
          store.commit('SET_SNACKBAR', {
            text: '不允许请求',
            color: 'warning',
          })
          break
        case 408:
          store.commit('SET_SNACKBAR', {
            text: '请求超时',
            color: 'warning',
          })
          break
        case 409:
          store.commit('SET_SNACKBAR', {
            text: '请求资源冲突',
            color: 'warning',
          })
          break
        case 422:
          store.commit('SET_SNACKBAR', {
            text: `无法处理的请求实体, 请求结果： ${error.response.data.Message}`,
            color: 'warning',
          })
          break
        case 500:
          store.commit('SET_SNACKBAR', {
            text: '服务器故障',
            color: 'error',
          })
          break
        case 502:
          store.commit('SET_SNACKBAR', {
            text: '网关错误',
            color: 'error',
          })
          break
        case 503:
          store.commit('SET_SNACKBAR', {
            text: '服务不可用',
            color: 'error',
          })
          break
        case 504:
          store.commit('SET_SNACKBAR', {
            text: '服务器响应超时',
            color: 'error',
          })
          break
        default:
          store.commit('SET_SNACKBAR', {
            text: '未知错误',
            color: 'error',
          })
          break
      }
    }
    return new Promise(() => { })
  },
)

export * from './log'
export * from './authentication'
export * from './tenant'
export * from './appstore'
export * from './resource'
export * from './system'
export * from './microservice'
export * from './metrics'
