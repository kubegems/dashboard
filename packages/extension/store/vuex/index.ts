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

import { delAllCookie } from '@kubegems/libs/utils/cookie';
import Vue from 'vue';
import Vuex, { Store } from 'vuex';

import globalModule from './modules/global';
import resourceModule from './modules/resource';
import uiModeule from './modules/ui';

Vue.use(Vuex);

const Locale = 'locale';

const store: Store<{ [key: string]: any }> = new Store({
  state: {
    ...uiModeule.state,
    ...resourceModule.state,
    ...globalModule.state,
  },
  mutations: {
    ...uiModeule.mutations,
    ...resourceModule.mutations,
    ...globalModule.mutations,
    CLEARALL(state: { [key: string]: any }): void {
      delAllCookie();
      const locale = window.localStorage.getItem(Locale) || 'zh-Hans';
      const themeColor = store.state.ThemeColor;
      window.localStorage.clear();
      store.commit('SET_THEME_COLOR', themeColor);
      state.JWT = '';
      state.User = {};
      state.TenantStore = [];
      state.ProjectStore = [];
      state.EnvironmentStore = [];
      state.ClusterStore = [];
      state.Auth = {
        environments: [],
        isSystemAdmin: false,
        projects: [],
        tenant: [],
        virtualSpaces: [],
      };
      state.Plugins = {};
      state.VirtualSpaceStore = [];
      state.LatestTenant = { tenant: '' };
      state.LatestProject = { project: '' };
      state.LatestEnvoronment = { environment: '' };
      state.LatestCluster = { cluster: '' };
      state.ApiResources = {};
      state.SelfOut = true;
      state.Locale = locale;
      window.localStorage.setItem(Locale, locale);
    },
  },
  actions: {
    ...uiModeule.actions,
    ...resourceModule.actions,
    ...globalModule.actions,
  },
  getters: {
    ...uiModeule.getters,
    ...resourceModule.getters,
    ...globalModule.getters,
  },
});

export const useStore = () => store;
export default store;
