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

import i18n from '@kubegems/extension/i18n';
import { useStore } from '@kubegems/extension/store';
import { integratedSentry } from '@kubegems/extension/tool/sentry';
import { integratedOpenTelemetry } from '@kubegems/extension/tool/tracing';
import Vue from 'vue';

import App from './App.vue';
import '@kubegems/extension/icon';
import '@/plugins/base';
import '@/directives/hjs';
import vuetify from '@/plugins/vuetify';
import router from '@/router';

import '@kubegems/extension/tool';

import '@/assets/styles/index.scss';
import './request';
import '@kubegems/api/response';

const store = useStore();

Vue.config.productionTip = false;

// 集成sentry
if (import.meta.env.VUE_APP_SENTRY === 'true') {
  integratedSentry({
    dsn: import.meta.env.VUE_APP_DSN,
    release: import.meta.env.VUE_APP_RELEASE,
    origins: import.meta.env.VUE_APP_ORIGINS,
    env: import.meta.env.VUE_APP_ENVIRONMENT,
    store: store,
    router: router,
  });
}

// 集成opentelemetry
if (import.meta.env.VUE_APP_TRACING === 'true') {
  integratedOpenTelemetry({
    release: import.meta.env.VUE_APP_RELEASE,
    collector: import.meta.env.VUE_APP_OTEL_COLLECTOR,
    store: store,
  });
}

const timeout: NodeJS.Timeout = setTimeout((): void => {
  // eslint-disable-next-line vue/require-name-property
  new Vue({
    vuetify,
    store,
    router,
    i18n,
    render: (h) => h(App),
  }).$mount('#app');
  clearTimeout(timeout);
}, 0);
