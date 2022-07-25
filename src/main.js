import { icons as antIconSet } from '@iconify-json/ant-design';
import { icons as cibIconSet } from '@iconify-json/cib';
import { icons as logosIconSet } from '@iconify-json/logos';
import { icons as mdiIconSet } from '@iconify-json/mdi';
import { Icon, addCollection } from '@iconify/vue2/dist/offline';
import hljs from 'highlight.js';
import yaml from 'js-yaml';
import _ from 'lodash';
import moment from 'moment';
import Vue from 'vue';
import VueMeta from 'vue-meta';
import ACEEditor from 'vue2-ace-editor';

import App from './App';
import vuetify from './plugins/vuetify';
import router from './router';
import './plugins/base';
import c from '@/plugins/const';
import t from '@/plugins/tip';
import store from '@/store';

import 'github-markdown-css/github-markdown.css';
import './assets/styles/index.scss';
import 'highlight.js/styles/atom-one-dark.css';

addCollection(logosIconSet);
addCollection(mdiIconSet);
addCollection(cibIconSet);
addCollection(antIconSet);

Vue.component('Icon', Icon);
Vue.component('ACEEditor', ACEEditor);

moment.locale('zh-cn');
Vue.prototype.$moment = moment;
Vue.prototype.$yamlload = (data) => {
  try {
    const d = yaml.load(data);
    return d;
  } catch (e) {
    store.commit('SET_SNACKBAR', {
      text: e.reason,
      color: 'warning',
    });
    return null;
  }
};
Vue.prototype.$yamldump = (data) => {
  try {
    const d = yaml.dump(data);
    return d;
  } catch (e) {
    store.commit('SET_SNACKBAR', {
      text: e.reason,
      color: 'warning',
    });
    return null;
  }
};
Vue.prototype.$_ = _;
Vue.config.productionTip = false;
Vue.prototype.$aceOptions = {
  tabSize: 2,
  fontSize: 12,
  printMarginColumn: 100,
  showPrintMargin: false,
  wrap: true,
  readOnly: false,
};
Vue.prototype.$aceinit = () => {
  require('brace/theme/chrome');
  require('brace/ext/language_tools');
  require('brace/ext/searchbox');
  require('brace/ext/beautify');
  require('brace/mode/yaml');
  require('brace/mode/json');
  require('brace/mode/xml');
  require('brace/mode/ini');
  require('brace/mode/html');
  require('brace/mode/java');
  require('brace/mode/python');
  require('brace/mode/golang');
  require('brace/mode/c_cpp');
  require('brace/mode/plain_text');
  require('brace/snippets/json');
};

Vue.use(VueMeta);
Vue.use(c);
Vue.use(t);

Vue.directive('highlight', function (el) {
  let blocks = el.querySelectorAll('pre code');
  blocks.forEach((block) => {
    hljs.highlightElement(block);
  });
});

const timeout = window.setTimeout(() => {
  // eslint-disable-next-line vue/require-name-property
  new Vue({
    vuetify,
    store,
    router,
    render: (h) => h(App),
  }).$mount('#app');
  clearTimeout(timeout);
}, 0);
