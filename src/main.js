/*
 * Copyright 2022 The kubegems.io Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "Licens");
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

import Vue from 'vue';
import VueMeta from 'vue-meta';
import ACEEditor from 'vue2-ace-editor';

import App from '@/App';
import i18n from '@/i18n';
import Icon from '@/icon';
import BreadcrumbTip from '@/plugins/breadcrumb';
import ConstField from '@/plugins/const';
import '@/plugins/base';
import '@/directives/hjs';
import '@/extension';
import vuetify from '@/plugins/vuetify';
import router from '@/router';
import store from '@/store';

import '@/assets/styles/index.scss';

Vue.config.productionTip = false;

Vue.component('ACEEditor', ACEEditor);
Vue.component('Icon', Icon);

Vue.use(BreadcrumbTip);
Vue.use(ConstField);
Vue.use(VueMeta);

const timeout = setTimeout(() => {
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
