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
import Vue from 'vue';

import App from './App.vue';
import '@kubegems/extension/icon';
import './plugins/base';
import vuetify from './plugins/vuetify';
import router from './router';
import '@kubegems/extension/tool';

import './assets/styles/index.scss';
import '@kubegems/api/response';
import './request';

const store = useStore();

Vue.config.productionTip = false;

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
