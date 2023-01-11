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
import Vue from 'vue';
import Vuex, { ActionContext, Store } from 'vuex';

import { useCluster, useEnvironment, useProject, useTenant, useVirtualSpace } from './server_data';
import { getBroadcastlist, getClusterPluginsList, getPluginsList, getRESTMapping } from '@/api';
import router from '@/router';
import { delAllCookie, getCookie } from '@/utils/cookie';
import { sleep } from '@/utils/helpers';

Vue.use(Vuex);

const CSRFTOKENNAME = 'csrftoken';
const JWTName = 'JWT';
const User = 'user';
const Admin = 'admin';
const AdminViewport = 'adminviewport';
const TenantStore = 'tenantstore';
const ProjectStore = 'projectstore';
const EnvironmentStore = 'environmentstore';
const ClusterStore = 'clusterstore';
const Auth = 'auth';
const Plugins = 'plugins';
const GlobalPlugins = 'globalplugins';
const VirtualSpaceStore = 'virtualspacestore';
const LatestTenant = 'latesttenant';
const LatestProject = 'latestproject';
const LatestEnvironment = 'latestenvironment';
const LatestCluster = 'latestcluster';
const Version = 'version';
const ApiResources = 'api-resources';
const StoreMode = 'store';
const Locale = 'locale';
const Broadcast = 'broadcast';
const Edge = 'edge';

const store: Store<{ [key: string]: any }> = new Store({
  state: {
    SidebarDrawer: null,
    Progress: false,
    Confirm: {},
    SidebarColor: 'white',
    SidebarBg: '',
    SnackBar: {},
    Csrftoken: getCookie(CSRFTOKENNAME),
    JWT: window.localStorage.getItem(JWTName),
    User: JSON.parse(window.localStorage.getItem(User)) || {},
    Auth: JSON.parse(window.localStorage.getItem(Auth)) || {
      environments: [],
      isSystemAdmin: false,
      projects: [],
      tenant: [],
      virtualSpaces: [],
    },
    Circular: false,
    Admin: [true, 'true'].includes(window.localStorage.getItem(Admin)),
    AdminViewport: [true, 'true'].includes(window.localStorage.getItem(AdminViewport)),
    NamespaceFilter: null,
    SidebarKey: '',
    MessageStreamWS: null,
    MessageStream: null,
    Scale: 1,
    Plugins: JSON.parse(window.localStorage.getItem(Plugins)) || {},
    GlobalPlugins: JSON.parse(window.localStorage.getItem(GlobalPlugins)) || {},
    VirtualSpaceStore: JSON.parse(window.localStorage.getItem(VirtualSpaceStore)) || [],
    ClusterStore: JSON.parse(window.localStorage.getItem(ClusterStore)) || [],
    TenantStore: JSON.parse(window.localStorage.getItem(TenantStore)) || [],
    ProjectStore: JSON.parse(window.localStorage.getItem(ProjectStore)) || [],
    EnvironmentStore: JSON.parse(window.localStorage.getItem(EnvironmentStore)) || [],
    EnvironmentFilter: null,
    LatestTenant: JSON.parse(window.localStorage.getItem(LatestTenant)) || {
      tenant: '',
    },
    LatestProject: JSON.parse(window.localStorage.getItem(LatestProject)) || {
      project: '',
    },
    LatestEnvironment: JSON.parse(window.localStorage.getItem(LatestEnvironment)) || {
      environment: '',
      cluster: '',
    },
    LatestCluster: JSON.parse(window.localStorage.getItem(LatestCluster)) || {
      cluster: '',
    },
    ReconnectCount: 0,
    PluginsInterval: null,
    DialogActive: false,
    PanelActive: false,
    FullDialogActive: false,
    Version: window.localStorage.getItem(Version) || '',
    ApiResources: JSON.parse(window.localStorage.getItem(ApiResources)) || {},
    SelfOut: false,
    StoreMode: window.localStorage.getItem(StoreMode) || 'app',
    GlobalPluginsInterval: null,
    Locale: window.localStorage.getItem(Locale) || 'zh-Hans',
    Broadcast: JSON.parse(window.localStorage.getItem(Broadcast)) || [],
    Edge: window.localStorage.getItem(Edge) || '',
  },
  mutations: {
    SET_PLUGINS(state: { [key: string]: any }, payload: { [key: string]: any }[]): void {
      state.Plugins = payload;
      window.localStorage.setItem(Plugins, JSON.stringify(payload));
    },
    SET_BROADCAST(state: { [key: string]: any }, payload: { [key: string]: any }[]): void {
      state.Broadcast = payload;
      window.localStorage.setItem(Broadcast, JSON.stringify(payload));
    },
    SET_GLOBAL_PLUGINS(state: { [key: string]: any }, payload: { [key: string]: any }[]): void {
      state.GlobalPlugins = payload;
      window.localStorage.setItem(GlobalPlugins, JSON.stringify(payload));
    },
    SET_EDGE(state: { [key: string]: any }, payload: string) {
      state.Edge = payload;
      window.localStorage.setItem(Edge, payload);
    },
    SET_DIALOG(state: { [key: string]: any }, payload: boolean) {
      state.DialogActive = payload;
    },
    SET_STORE(state: { [key: string]: any }, payload: string): void {
      state.StoreMode = payload;
      window.localStorage.setItem(StoreMode, payload);
    },
    SET_LOCALE(state: { [key: string]: any }, payload: string): void {
      state.Locale = payload;
      window.localStorage.setItem(Locale, payload);
    },
    SET_VERSION(state: { [key: string]: any }, payload: string): void {
      state.Version = payload;
      window.localStorage.setItem(Version, payload);
    },
    SET_PANEL(state: { [key: string]: any }, payload: boolean): void {
      state.PanelActive = payload;
    },
    SET_FULL_DIALOG(state: { [key: string]: any }, payload: boolean): void {
      state.FullDialogActive = payload;
    },
    SET_SIDEBAR_DRAWER(state: { [key: string]: any }, payload: any): void {
      state.SidebarDrawer = payload;
    },
    SET_CONFIRM(
      state: { [key: string]: any },
      {
        title,
        content,
        doFunc,
        param,
        doClose = () => {
          return;
        },
      }: { [key: string]: any },
    ): void {
      state.Confirm = {
        title,
        content,
        doFunc,
        param,
        value: true,
        doClose,
      };
    },
    SET_CONFIRM_STATUS(state: { [key: string]: any }, paload: { [key: string]: any }): void {
      if (state.Confirm.content && state.Confirm.content.type === 'batch_delete') {
        state.Confirm.content.status[paload.key] = paload.value;
      }
    },
    SET_PROGRESS(state: { [key: string]: any }, payload: boolean): void {
      state.Progress = payload;
    },
    SET_SCALE(state: { [key: string]: any }, payload: number): void {
      state.Scale = payload;
    },
    SET_NAMESPACE_FILTER(state: { [key: string]: any }, payload: { [key: string]: any }): void {
      state.NamespaceFilter = payload;
    },
    SET_ENVIRONMENT_FILTER(state: { [key: string]: any }, payload: { [key: string]: any }): void {
      state.EnvironmentFilter = payload;
    },
    SET_ADMIN(state: { [key: string]: any }, payload: boolean): void {
      state.Admin = payload;
      window.localStorage.setItem(Admin, String(payload));
    },
    SET_ADMIN_VIEWPORT(state: { [key: string]: any }, payload: boolean): void {
      state.AdminViewport = payload;
      window.localStorage.setItem(AdminViewport, String(payload));
    },
    SET_LATEST_TENANT(state: { [key: string]: any }, payload: { [key: string]: string | number }): void {
      state.LatestTenant = payload;
      window.localStorage.setItem(LatestTenant, JSON.stringify(payload));
    },
    SET_LATEST_PROJECT(state: { [key: string]: any }, payload: { [key: string]: string | number }): void {
      state.LatestProject = payload;
      window.localStorage.setItem(LatestProject, JSON.stringify(payload));
    },
    SET_LATEST_ENVIRONMENT(state: { [key: string]: any }, payload: { [key: string]: string | number }): void {
      state.LatestEnvironment = payload;
      window.localStorage.setItem(LatestEnvironment, JSON.stringify(payload));
    },
    SET_LATEST_CLUSTER(state: { [key: string]: any }, payload: { [key: string]: string | number }): void {
      state.LatestCluster = payload;
      window.localStorage.setItem(LatestCluster, JSON.stringify(payload));
    },
    SET_CIRCULAR(state: { [key: string]: any }, payload: boolean): void {
      state.Circular = payload;
    },
    SET_SNACKBAR(state: { [key: string]: any }, { text, color }: { [key: string]: any }): void {
      if (!color) {
        return;
      }
      let icon = 'mdi-information';
      switch (color) {
        case 'success':
          icon = 'mdi-information';
          break;
        case 'warning':
          icon = 'mdi-alert';
          break;
        case 'error':
          icon = 'mdi-close-circle';
          break;
      }
      state.SnackBar = { text, color, value: true, collapse: true, icon: icon };
    },
    SET_JWT(state: { [key: string]: any }, jwt: string): void {
      state.JWT = jwt;
      window.localStorage.setItem(JWTName, jwt);
    },
    SET_API_RESOURCES(state: { [key: string]: any }, payload: { [key: string]: any }): void {
      state.ApiResources = payload;
      window.localStorage.setItem(ApiResources, JSON.stringify(payload));
    },
    CLEARALL(state: { [key: string]: any }): void {
      delAllCookie();
      const locale = window.localStorage.getItem(Locale) || 'zh-Hans';
      window.localStorage.clear();
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
    CLEAR_PLUGINS_INTERVAL(state: { [key: string]: any }): void {
      clearInterval(state.PluginsInterval);
      state.PluginsInterval = null;
    },
    CLEAR_VIRTUAL_SPACE(state: { [key: string]: any }): void {
      window.localStorage.removeItem(VirtualSpaceStore);
      state.VirtualSpaceStore = [];
      state.EnvironmentFilter = null;
    },
    CLEAR_RESOURCE(state: { [key: string]: any }): void {
      window.localStorage.removeItem(LatestCluster);
      clearInterval(state.PluginsInterval);
      state.PluginsInterval = null;
      state.LatestCluster = { cluster: '' };
    },
    CLEAR_TENANT(state: { [key: string]: any }): void {
      window.localStorage.removeItem(TenantStore);
      window.localStorage.removeItem(ProjectStore);
      window.localStorage.removeItem(EnvironmentStore);
      window.localStorage.removeItem(VirtualSpaceStore);
      window.localStorage.removeItem(LatestTenant);
      window.localStorage.removeItem(LatestProject);
      window.localStorage.removeItem(LatestEnvironment);
      state.TenantStore = [];
      state.ProjectStore = [];
      state.EnvironmentStore = [];
      clearInterval(state.PluginsInterval);
      state.PluginsInterval = null;
      state.VirtualSpaceStore = [];
      state.LatestTenant = { tenant: '' };
      state.LatestProject = { project: '' };
      state.LatestEnvoronment = { environment: '' };
    },
    CLEAR_RESOURCEIRONMENT(state: { [key: string]: any }): void {
      window.localStorage.removeItem(EnvironmentStore);
      state.EnvironmentStore = [];
      clearInterval(state.PluginsInterval);
      state.Plugins = null;
    },
    CLEAR_CLUSTER(state: { [key: string]: any }): void {
      window.localStorage.removeItem(ClusterStore);
      window.localStorage.removeItem(LatestCluster);
      state.ClusterStore = [];
      clearInterval(state.PluginsInterval);
      state.Plugins = null;
      state.LatestCluster = { cluster: '' };
    },
    SET_USER(state: { [key: string]: any }, user: { [key: string]: any }): void {
      state.User = user;
      window.localStorage.setItem(User, JSON.stringify(user));
    },
    SET_USER_AUTH(state: { [key: string]: any }, auth: { [key: string]: any }): void {
      state.Auth = auth;
      window.localStorage.setItem(Auth, JSON.stringify(auth));
    },
    SET_SIDEBAR_KEY(state: { [key: string]: any }): void {
      state.SidebarKey = new Date().toJSON();
    },
    SET_VIRTUAL_SPACE(state: { [key: string]: any }, payload: { [key: string]: string | number }[]): void {
      state.VirtualSpaceStore = payload;
      window.localStorage.setItem(VirtualSpaceStore, JSON.stringify(payload));
    },
    SET_CLUSTER(state: { [key: string]: any }, payload: { [key: string]: string | number }[]): void {
      state.ClusterStore = payload;
      window.localStorage.setItem(ClusterStore, JSON.stringify(payload));
    },
    SET_TENANT(state: { [key: string]: any }, payload: { [key: string]: string | number }[]): void {
      state.TenantStore = payload;
      window.localStorage.setItem(TenantStore, JSON.stringify(payload));
    },
    SET_PROJECT(state: { [key: string]: any }, payload: { [key: string]: string | number }[]): void {
      state.ProjectStore = payload;
      window.localStorage.setItem(ProjectStore, JSON.stringify(payload));
    },
    SET_ENVIRONMENT(state: { [key: string]: any }, payload: { [key: string]: string | number }[]): void {
      state.EnvironmentStore = payload;
      window.localStorage.setItem(EnvironmentStore, JSON.stringify(payload));
    },
  },
  actions: {
    async UPDATE_VIRTUALSPACE_DATA({
      commit,
    }: ActionContext<
      {
        [key: string]: any;
      },
      {
        [key: string]: any;
      }
    >): Promise<void> {
      const data: { [key: string]: string | number }[] = await useVirtualSpace();
      commit('SET_VIRTUAL_SPACE', data);
    },
    async UPDATE_CLUSTER_DATA({
      commit,
    }: ActionContext<
      {
        [key: string]: any;
      },
      {
        [key: string]: any;
      }
    >): Promise<void> {
      const data: { [key: string]: string | number }[] = await useCluster();
      commit('SET_CLUSTER', data);
    },
    async UPDATE_TENANT_DATA({
      state,
      commit,
    }: ActionContext<
      {
        [key: string]: any;
      },
      {
        [key: string]: any;
      }
    >): Promise<void> {
      const data: { [key: string]: string | number }[] = await useTenant(state.Admin, state.User.ID);
      commit('SET_TENANT', data);
    },
    async UPDATE_PROJECT_DATA(
      {
        commit,
      }: ActionContext<
        {
          [key: string]: any;
        },
        {
          [key: string]: any;
        }
      >,
      payload: number,
    ): Promise<void> {
      const data: { [key: string]: string | number }[] = await useProject(payload);
      commit('SET_PROJECT', data);
    },
    async UPDATE_ENVIRONMENT_DATA(
      {
        commit,
      }: ActionContext<
        {
          [key: string]: any;
        },
        {
          [key: string]: any;
        }
      >,
      payload: number,
    ): Promise<void> {
      const data: { [key: string]: string | number }[] = await useEnvironment(payload);
      commit('SET_ENVIRONMENT', data);
    },
    async INIT_GLOBAL_PLUGINS({
      state,
      commit,
    }: ActionContext<
      {
        [key: string]: any;
      },
      {
        [key: string]: any;
      }
    >): Promise<void> {
      // if (state.Edge) return;

      const doFunc = async () => {
        const data: any = await getPluginsList({
          noprocessing: true,
        });
        const p = {};
        data.forEach((d) => {
          p[d.name] = d.enabled;
        });
        if (p) commit('SET_GLOBAL_PLUGINS', p);
      };
      if (!state.GlobalPluginsInterval && state.JWT) {
        await doFunc();
        state.GlobalPluginsInterval = setInterval(doFunc, 1000 * 30);
      }
    },
    async INIT_PLUGINS(
      {
        state,
        getters,
        commit,
      }: ActionContext<
        {
          [key: string]: any;
        },
        {
          [key: string]: any;
        }
      >,
      payload: string,
    ): Promise<void> {
      // if (state.Edge) return;

      type doHandle = () => Promise<boolean>;
      const doFunc: doHandle = async (): Promise<boolean> => {
        const cluster: string = payload;
        if (cluster && cluster?.length > 0) {
          const data: any = await getClusterPluginsList(cluster, {
            simple: true,
            noprocessing: true,
          });
          if (data) commit('SET_PLUGINS', data);
          return true;
        }
        return false;
      };
      let refresh = false;
      if (state.AdminViewport && state.LatestCluster.cluster !== getters.Cluster().ClusterName) {
        refresh = true;
      } else if (
        (!state.AdminViewport && state.LatestEnvironment.cluster !== getters.Environment().ClusterName) ||
        state.Edge
      ) {
        refresh = true;
      }
      if ((!state.PluginsInterval && state.JWT) || refresh) {
        clearInterval(state.PluginsInterval);
        const r: boolean = await doFunc();
        if (r) {
          state.PluginsInterval = setInterval(() => {
            doFunc();
          }, 1000 * 30);
        }
      }
    },
    async INIT_BROADCAST({
      commit,
    }: ActionContext<
      {
        [key: string]: any;
      },
      {
        [key: string]: any;
      }
    >): Promise<void> {
      type doHandle = () => Promise<void>;
      const doFunc: doHandle = async (): Promise<void> => {
        const data: { [key: string]: any } = await getBroadcastlist({
          size: 1000,
          noprocessing: true,
          active: true,
        });
        const items = data.List;
        if (items) commit('SET_BROADCAST', items);
      };
      await doFunc();
    },
    async INIT_MESSAGE_STREAM({
      state,
      dispatch,
    }: ActionContext<
      {
        [key: string]: any;
      },
      {
        [key: string]: any;
      }
    >): Promise<void> {
      if (!state.MessageStreamWS && state.JWT) {
        const protocol: string = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const host: string = window.location.host;
        const wsuri = `${protocol}://${host}/realtime/v2/msgbus/notify?token=${state.JWT}`;
        state.MessageStreamWS = new WebSocket(wsuri);
        state.MessageStreamWS.binaryType = 'arraybuffer';
        state.MessageStreamWS.onmessage = (e: any): void => {
          state.MessageStream = e.data;
        };
        state.MessageStreamWS.onerror = async (): Promise<void> => {
          if (state.MessageStreamWS) state.MessageStreamWS.close();
          state.MessageStreamWS = null;
          if (state.ReconnectCount <= 5) {
            await sleep(1000);
            dispatch('INIT_MESSAGE_STREAM');
            state.ReconnectCount += 1;
          }
        };
        state.MessageStreamWS.onclose = async (): Promise<void> => {
          state.MessageStreamWS = null;
          if (state.ReconnectCount <= 5) {
            await sleep(1000);
            dispatch('INIT_MESSAGE_STREAM');
            state.ReconnectCount += 1;
          }
        };
      }
    },
    async LOAD_RESTMAPPING_RESOURCES(
      {
        commit,
      }: ActionContext<
        {
          [key: string]: any;
        },
        {
          [key: string]: any;
        }
      >,
      payload: { [key: string]: string },
    ): Promise<void> {
      if (!payload.clusterName) return;
      const data: { [key: string]: any } = await getRESTMapping(payload.clusterName);
      const resource: { [key: string]: string } = {};
      data.forEach((d) => {
        if (!d?.groupVersion.startsWith('apps.kruise.io') && d?.groupVersion.indexOf('knative') === -1) {
          d?.resources?.forEach((r) => {
            if (!resource[r.kind.toLocaleLowerCase()]) resource[r.kind.toLocaleLowerCase()] = d.groupVersion;
          });
        }
      });
      commit('SET_API_RESOURCES', resource);
    },
  },
  getters: {
    VirtualSpace: (state) => (): { [key: string]: string | number } => {
      const store: { [key: string]: string | number }[] = state.VirtualSpaceStore;
      let virtualSpace = window.location.pathname.split('/')[3];
      if (router) {
        virtualSpace = router.currentRoute.params.virtualspace;
      }
      if (virtualSpace) {
        const space: { [key: string]: string | number } = store.find((v) => {
          return v.VirtualSpaceName === virtualSpace;
        });
        if (space) {
          if (
            state.Admin ||
            state.Auth.tenant.find((t) => {
              return t.isAdmin;
            }) ||
            state.Auth.virtualSpaces.find((v) => {
              return v.name === virtualSpace;
            })
          ) {
            return space;
          } else {
            if (router) {
              router.push({ name: '403' });
              return {
                ID: 0,
                VirtualSpaceName: '',
              };
            }
          }
        }
        return {
          ID: 0,
          VirtualSpaceName: '',
        };
      }
      return {
        ID: 0,
        VirtualSpaceName: '',
      };
    },
    Cluster: (state) => (): { [key: string]: string | number } => {
      const store: { [key: string]: string | number }[] = state.ClusterStore;
      let cluster: string = window.location.pathname.split('/')[2];
      if (router) {
        cluster = router.currentRoute.params.cluster;
      }
      if (!cluster && state.LatestCluster.cluster !== '') {
        cluster = state.LatestCluster.cluster;
      }
      if (cluster) {
        const cl = store.find((v) => {
          return v.ClusterName === cluster;
        });
        if (cl) {
          if (state.Admin) {
            return cl;
          } else {
            if (router) {
              router.push({ name: '403' });
              return {
                ID: 0,
                ClusterName: '',
                Version: '',
              };
            }
          }
        }
        return {
          ID: 0,
          ClusterName: '',
          Version: '',
        };
      } else if (store.length > 0) {
        return store[0];
      }
      return {
        ID: 0,
        ClusterName: '',
        Version: '',
      };
    },
    Tenant: (state) => (): { [key: string]: string | number } => {
      const store: { [key: string]: string | number }[] = state.TenantStore;
      let tenant: string = window.location.pathname.split('/')[2];
      if (router) {
        tenant = router.currentRoute.params.tenant;
      }

      if (!tenant && state.LatestTenant.tenant !== '') {
        tenant = state.LatestTenant.tenant;
      }
      if (tenant) {
        const ten = store.find((t) => {
          return t.TenantName === tenant;
        });
        if (ten) {
          return ten;
        }
        return {
          ID: 0,
          TenantName: '',
        };
      } else if (store.length > 0) {
        return store[0];
      }
      return {
        ID: 0,
        TenantName: '',
      };
    },
    Project: (state) => (): { [key: string]: string | number } => {
      const store: { [key: string]: string | number }[] = state.ProjectStore;
      let project: string = window.location.pathname.split('/')[4];
      if (router) {
        project = router.currentRoute.params.project;
      }
      if (project) {
        const pro = store.find((v) => {
          return v.ProjectName === project;
        });
        if (pro) {
          return pro;
        }
        return {
          ID: 0,
          ProjectName: '',
        };
      }
      return {
        ID: 0,
        ProjectName: '',
      };
    },
    Environment: (state) => (): { [key: string]: string | number | boolean } => {
      const store: { [key: string]: string | number }[] = state.EnvironmentStore;
      let environment: string = window.location.pathname.split('/')[6];
      if (router) {
        environment = router.currentRoute.params.environment || environment;
      }
      if (environment) {
        const env = store.find((v) => {
          return v.EnvironmentName === environment;
        });
        if (env) {
          return env;
        }
        return {
          EnvironmentName: '',
          ID: 0,
          Namespace: '',
          ClusterName: '',
          ClusterID: 0,
          Type: '',
          Version: '',
          AllowEdgeRegistration: false,
        };
      }
      return {
        EnvironmentName: '',
        ID: 0,
        Namespace: '',
        ClusterName: '',
        ClusterID: 0,
        Type: '',
        Version: '',
        AllowEdgeRegistration: false,
      };
    },
  },
});

export const useStore = () => store;
export default store;
