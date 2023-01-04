/*
 * Copyright 2022 The kubegems.io Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import qs from 'qs';

import { useGlobalI18n } from '@/i18n';
import { useRouter } from '@/router';
import { useStore } from '@/store';
import { getQueryString, validateJWT } from '@/utils/helpers';

const store = useStore();
const router = useRouter();
const i18n = useGlobalI18n();

axios.defaults.baseURL = `${window.location.origin}/api/v1`;
axios.defaults.timeout = 1000 * parseInt(import.meta.env.VUE_APP_API_TIMEOUT);
axios.defaults.paramsSerializer = (params: any): string => {
  return qs.stringify(params, { arrayFormat: 'brackets' });
};

axios.interceptors.request.use(
  (config: AxiosRequestConfig<KubeRequest>): AxiosRequestConfig<KubeRequest> | Promise<any> => {
    if (
      !validateJWT(window.localStorage.getItem('JWT')) &&
      ['/login', '/403', '/404', '/white/page', '/white/tenant', '/whitecluster/cluster', '/oauth/callback'].indexOf(
        window.location.pathname,
      ) === -1
    ) {
      store.commit('CLEARALL');
      store.commit('SET_VERSION', import.meta.env.VUE_APP_RELEASE);
      window.localStorage.clear();
      router.push({
        name: 'login',
        query: {
          redirect: `${window.location.pathname}${window.location.search}`,
        },
      });
      store.commit('SET_SNACKBAR', {
        text: i18n.t('tip.token_expired'),
        color: 'error',
      });
      return new Promise(() => {
        return;
      });
    }
    if (
      new RegExp('undefined|//', 'g').test(config.url) ||
      (config.method.toLocaleLowerCase() === 'get' &&
        config.params &&
        Object.values(config.params).indexOf(undefined) > -1) ||
      (config.method.toLocaleLowerCase() in ['post', 'patch', 'put', 'delete'] &&
        config.data &&
        Object.values(config.data).indexOf(undefined) > -1)
    ) {
      console.log(config);
      store.commit('SET_SNACKBAR', {
        text: i18n.t('tip.request_params_error'),
        color: 'error',
      });
      return new Promise(() => {
        return;
      });
    }
    if (config.method.toLocaleLowerCase() === 'get' && config.url.indexOf('callback') === -1) {
      if (!(config.params && config.params.noprocessing)) {
        store.commit('SET_PROGRESS', true);
      }
    } else if (['post', 'patch', 'put', 'delete'].indexOf(config.method.toLocaleLowerCase()) > -1) {
      store.commit('SET_CIRCULAR', true);
    }
    if (store.state.Csrftoken) {
      config.headers['X-CSRFToken'] = store.state.Csrftoken;
    }
    if (window.localStorage.getItem('JWT')) {
      config.headers.Authorization = `Bearer ${window.localStorage.getItem('JWT')}`;
    }
    if (config.method.toLocaleLowerCase() in ['post', 'patch', 'put', 'delete']) {
      config.headers['Content-type'] = 'application/json;charset=utf-8';
    }

    // 处理edge proxy转发
    if (store.state.Edge || location.href.indexOf('/edges/') > -1) {
      const reg = new RegExp('^proxy/cluster/.+?/(.*)', 'g');
      const urlMatch: RegExpExecArray = reg.exec(config.url);
      if (urlMatch) {
        const redirectUrl = urlMatch[1];
        let edge = store.state.Edge;
        if (location.href.indexOf('/edges/') > -1 && getQueryString('edgeName')) {
          edge = getQueryString('edgeName');
        }
        config.url = `edge-clusters/${edge}/proxy/${redirectUrl}`;
      }
    }

    config.url = encodeURI(config.url);

    return config;
  },
);

axios.interceptors.response.use(
  (response: AxiosResponse<KubeResponse<any, any>, KubeRequest>): Promise<KubeResponse<any, any>> => {
    if (!(response && response.config && response.config.params && response.config.params.noprocessing)) {
      store.commit('SET_PROGRESS', false);
    }
    if ([200, 201, 204].indexOf(response.status) > -1) {
      if (['put', 'post', 'patch', 'delete'].indexOf(response.config.method) > -1) {
        store.commit('SET_CIRCULAR', false);
        if (
          !new RegExp('^(cluster/validate-kubeconfig)$|^(logqueryhistory)$|^(message/\\d+)$').test(response.config.url)
        ) {
          store.commit('SET_SNACKBAR', {
            text: i18n.t('tip.success'),
            color: 'success',
          });
        }
      }
      return response.data.Data || response.data.data || response.data;
    } else {
      store.commit('SET_PROGRESS', false);
      store.commit('SET_CIRCULAR', false);
      store.commit('SET_SNACKBAR', {
        text: response.data?.Message || response.data?.message || '',
        color: 'warning',
      });
    }
  },
  (error: any): Promise<unknown> => {
    store.commit('SET_PROGRESS', false);
    store.commit('SET_CIRCULAR', false);
    // 方便排查
    console.log(error);
    if (!(error && error.response)) {
      if (error.toString().indexOf('timeout') > -1) {
        store.commit('SET_SNACKBAR', {
          text: i18n.t('tip.timeout'),
          color: 'error',
        });
      } else {
        store.commit('SET_SNACKBAR', {
          text: error,
          color: 'error',
        });
      }
    } else {
      switch (error.response.status) {
        case 400:
          store.commit('SET_SNACKBAR', {
            text:
              typeof error.response.data.ErrorData === 'string' || typeof error.response.data.errorData === 'string'
                ? error.response.data.ErrorData || error.response.data.errorData
                : error.response.data.Message || error.response.data.data.message,
            color: 'error',
          });
          break;
        case 401:
          store.commit('SET_SNACKBAR', {
            text: i18n.t('tip.401'),
            color: 'warning',
          });
          store.commit('CLEARALL');
          store.commit('SET_VERSION', import.meta.env.VUE_APP_RELEASE);
          if (
            ['/login', '/403', '/404', '/white/page', '/white/tenant', '/whitecluster/cluster'].indexOf(
              window.location.pathname,
            ) === -1
          ) {
            router.push({
              name: 'login',
              query: {
                redirect: `${window.location.pathname}${window.location.search}`,
              },
            });
          }
          if (window.location.pathname.startsWith('/oauth/callback')) {
            router.push({
              name: 'login',
            });
          }
          break;
        case 403:
          store.commit('SET_SNACKBAR', {
            text: i18n.t('tip.403'),
            color: 'warning',
          });
          break;
        case 404:
          store.commit('SET_SNACKBAR', {
            text: i18n.t('tip.404'),
            color: 'warning',
          });
          break;
        case 405:
          store.commit('SET_SNACKBAR', {
            text: i18n.t('tip.405'),
            color: 'warning',
          });
          break;
        case 408:
          store.commit('SET_SNACKBAR', {
            text: i18n.t('tip.timeout'),
            color: 'warning',
          });
          break;
        case 409:
          store.commit('SET_SNACKBAR', {
            text: i18n.t('tip.409'),
            color: 'warning',
          });
          break;
        case 422:
          store.commit('SET_SNACKBAR', {
            text: `${i18n.t('tip.422')} ${error.response.data.Message || error.response.data.message}`,
            color: 'warning',
          });
          break;
        case 500:
          store.commit('SET_SNACKBAR', {
            text: i18n.t('tip.500'),
            color: 'error',
          });
          break;
        case 502:
          store.commit('SET_SNACKBAR', {
            text: i18n.t('tip.502'),
            color: 'error',
          });
          break;
        case 503:
          store.commit('SET_SNACKBAR', {
            text: i18n.t('tip.503'),
            color: 'error',
          });
          break;
        case 504:
          store.commit('SET_SNACKBAR', {
            text: i18n.t('tip.504'),
            color: 'error',
          });
          break;
        default:
          store.commit('SET_SNACKBAR', {
            text: i18n.t('tip.unknown_error'),
            color: 'error',
          });
          break;
      }
    }
    return new Promise(() => {
      return;
    });
  },
);
