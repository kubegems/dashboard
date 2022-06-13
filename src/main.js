import Vue from 'vue';

import moment from 'moment';
import yaml from 'js-yaml';
import _ from 'lodash';
import ACEEditor from 'vue2-ace-editor';
import VueSlider from 'vue-slider-component';
import VuePageTitle from 'vue-page-title';
import { VueOkrTree } from 'vue-okr-tree';
import { Icon } from '@iconify/vue2';
import router from './router';
import vuetify from './plugins/vuetify';
import App from './App';
import './plugins/base';
import 'github-markdown-css/github-markdown.css';
import 'vue-okr-tree/dist/vue-okr-tree.css';
import 'vue-slider-component/theme/default.css';
import './assets/styles/index.scss';
import directives from './directives';
import t from '@/plugins/tip';
import c from '@/plugins/const';
import store from '@/store';

Vue.component('Icon', Icon);
Vue.component('ACEEditor', ACEEditor);
Vue.component('VueOkrTree', VueOkrTree);
Vue.component('VueSlider', VueSlider);

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
  require('brace/mode/plain_text');
  require('brace/snippets/json');
};

Vue.use(VuePageTitle, {
  router: router,
  suffix: ' - KubeGems',
});
Vue.use(directives);
Vue.use(c);
Vue.use(t);

// eslint-disable-next-line vue/require-name-property
new Vue({
  vuetify,
  store,
  router,
  render: (h) => h(App),
}).$mount('#app');
