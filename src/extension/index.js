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
import yaml from 'js-yaml';
import _ from 'lodash';
import moment from 'moment';
import Vue from 'vue';
import 'moment/dist/locale/zh-cn';
import 'moment/dist/locale/ja';
import 'moment/dist/locale/zh-tw';

import store from '@/store';

Vue.prototype.$aceOptions = {
  tabSize: 2,
  fontSize: 12,
  printMarginColumn: 100,
  showPrintMargin: false,
  wrap: true,
  readOnly: false,
};
Vue.prototype.$aceinit = () => {
  import.meta.globEager('brace/theme/chrome');
  import.meta.globEager('brace/ext/language_tools');
  import.meta.globEager('brace/ext/searchbox');
  import.meta.globEager('brace/ext/beautify');
  import.meta.globEager('brace/mode/yaml');
  import.meta.globEager('brace/mode/json');
  import.meta.globEager('brace/mode/xml');
  import.meta.globEager('brace/mode/ini');
  import.meta.globEager('brace/mode/html');
  import.meta.globEager('brace/mode/java');
  import.meta.globEager('brace/mode/python');
  import.meta.globEager('brace/mode/golang');
  import.meta.globEager('brace/mode/c_cpp');
  import.meta.globEager('brace/mode/plain_text');
  import.meta.globEager('brace/snippets/json');
};

moment.locale(
  (() => {
    if (store.state.Locale === 'zh-Hans') {
      return 'zh-cn';
    }
    if (store.state.Locale === 'zh-Hant') {
      return 'zh-tw';
    }
    return store.state.Locale;
  })(),
);
Vue.prototype.$moment = moment;

Vue.prototype.$_ = _;

Vue.prototype.$yamlload = (data) => {
  try {
    const d = yaml.load(data);
    if (typeof d === 'string') {
      store.commit('SET_SNACKBAR', {
        text: Vue.prototype.$_i18n.t('tip.not_based_yaml'),
        color: 'warning',
      });
      return null;
    }
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
