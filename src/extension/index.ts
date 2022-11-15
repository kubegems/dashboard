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
import 'brace/theme/chrome';
import 'brace/ext/language_tools';
import 'brace/ext/searchbox';
import 'brace/ext/beautify';
import 'brace/mode/yaml';
import 'brace/mode/json';
import 'brace/mode/xml';
import 'brace/mode/ini';
import 'brace/mode/html';
import 'brace/mode/java';
import 'brace/mode/python';
import 'brace/mode/golang';
import 'brace/mode/c_cpp';
import 'brace/mode/csharp';
import 'brace/mode/css';
import 'brace/mode/javascript';
import 'brace/mode/plain_text';
import 'brace/mode/sass';
import 'brace/mode/scss';
import 'brace/snippets/json';

import store from 'src/store';

Vue.prototype.$aceOptions = {
  tabSize: 2,
  fontSize: 12,
  printMarginColumn: 100,
  showPrintMargin: false,
  wrap: true,
  readOnly: false,
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

Vue.prototype.$yamlload = (data: string): Record<string, unknown> | null => {
  try {
    const d: Record<string, unknown> = yaml.load(data);
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
Vue.prototype.$yamldump = (data): string | null => {
  try {
    const d: string = yaml.dump(data);
    return d;
  } catch (e) {
    store.commit('SET_SNACKBAR', {
      text: e.reason,
      color: 'warning',
    });
    return null;
  }
};
