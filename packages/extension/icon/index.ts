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

import { icons as logosIconSet } from '@iconify-json/logos';
import { icons as mdiIconSet } from '@iconify-json/mdi';
import { Icon as OnlineIcon } from '@iconify/vue2';
import { Icon as OfflineIcon, addCollection } from '@iconify/vue2/dist/offline';
import Vue from 'vue';

const online = (import.meta as any).env.VUE_APP_ICON_ONLINE === 'true';

if (online) {
  Vue.component('Icon', OnlineIcon);
} else {
  addCollection(logosIconSet);
  addCollection(mdiIconSet);

  Vue.component('Icon', OfflineIcon);
}

export default online ? OnlineIcon : OfflineIcon;
