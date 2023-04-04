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
import Vue from 'vue';

import { useStore } from '../store';

const store = useStore();

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
