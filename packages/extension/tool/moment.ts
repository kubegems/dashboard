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
import 'moment/dist/locale/zh-cn';
import 'moment/dist/locale/ja';
import 'moment/dist/locale/zh-tw';
import moment from 'moment';
import Vue from 'vue';

import { useStore } from '../store';

const store = useStore();

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
