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

moment.locale(store.state.Locale === 'zh-Hans' ? 'zh-cn' : store.state.Locale);
Vue.prototype.$moment = moment;

Vue.prototype.$_ = _;

Vue.prototype.$yamlload = (data) => {
  try {
    const d = yaml.load(data);
    if (typeof d === 'string') {
      store.commit('SET_SNACKBAR', {
        text: '不符合标准的yaml格式',
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
