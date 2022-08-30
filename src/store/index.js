import Vue from 'vue';
import Vuex, { Store } from 'vuex';

import {
  getClusterSelectData,
  getEnvironmentSelectData,
  getProjectSelectData,
  getTenantSelectData,
  getVirtualSpaceSelectData,
} from './server_data';
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

export default new Store({
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
    BroadcastInterval: null,
    Broadcast: JSON.parse(window.localStorage.getItem(Broadcast)) || [],
  },
  mutations: {
    SET_PLUGINS(state, payload) {
      state.Plugins = payload;
      window.localStorage.setItem(Plugins, JSON.stringify(payload));
    },
    SET_BROADCAST(state, payload) {
      state.Broadcast = payload;
      window.localStorage.setItem(Broadcast, JSON.stringify(payload));
    },
    SET_GLOBAL_PLUGINS(state, payload) {
      state.GlobalPlugins = payload;
      window.localStorage.setItem(GlobalPlugins, JSON.stringify(payload));
    },
    SET_DIALOG(state, payload) {
      state.DialogActive = payload;
    },
    SET_STORE(state, payload) {
      state.StoreMode = payload;
      window.localStorage.setItem(StoreMode, payload);
    },
    SET_LOCALE(state, payload) {
      state.Locale = payload;
      window.localStorage.setItem(Locale, payload);
    },
    SET_VERSION(state, payload) {
      state.Version = payload;
      window.localStorage.setItem(Version, payload);
    },
    SET_PANEL(state, payload) {
      state.PanelActive = payload;
    },
    SET_FULL_DIALOG(state, payload) {
      state.FullDialogActive = payload;
    },
    SET_SIDEBAR_DRAWER(state, payload) {
      state.SidebarDrawer = payload;
    },
    SET_CONFIRM(state, { title, content, doFunc, param, doClose = () => {} }) {
      state.Confirm = {
        title,
        content,
        doFunc,
        param,
        value: true,
        doClose,
      };
    },
    SET_CONFIRM_STATUS(state, paload) {
      if (state.Confirm.content && state.Confirm.content.type === 'batch_delete') {
        state.Confirm.content.status[paload.key] = paload.value;
      }
    },
    SET_PROGRESS(state, payload) {
      state.Progress = payload;
    },
    SET_SCALE(state, payload) {
      state.Scale = payload;
    },
    SET_NAMESPACE_FILTER(state, payload) {
      state.NamespaceFilter = payload;
    },
    SET_ENVIRONMENT_FILTER(state, payload) {
      state.EnvironmentFilter = payload;
    },
    SET_ADMIN(state, payload) {
      state.Admin = payload;
      window.localStorage.setItem(Admin, payload);
    },
    SET_ADMIN_VIEWPORT(state, payload) {
      state.AdminViewport = payload;
      window.localStorage.setItem(AdminViewport, payload);
    },
    SET_LATEST_TENANT(state, payload) {
      state.LatestTenant = payload;
      window.localStorage.setItem(LatestTenant, JSON.stringify(payload));
    },
    SET_LATEST_PROJECT(state, payload) {
      state.LatestProject = payload;
      window.localStorage.setItem(LatestProject, JSON.stringify(payload));
    },
    SET_LATEST_ENVIRONMENT(state, payload) {
      state.LatestEnvironment = payload;
      window.localStorage.setItem(LatestEnvironment, JSON.stringify(payload));
    },
    SET_LATEST_CLUSTER(state, payload) {
      state.LatestCluster = payload;
      window.localStorage.setItem(LatestCluster, JSON.stringify(payload));
    },
    SET_CIRCULAR(state, payload) {
      state.Circular = payload;
    },
    SET_SNACKBAR(state, { text, color }) {
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
    SET_JWT(state, jwt) {
      state.JWT = jwt;
      window.localStorage.setItem(JWTName, jwt);
    },
    SET_API_RESOURCES(state, payload) {
      state.ApiResources = payload;
      window.localStorage.setItem(ApiResources, JSON.stringify(payload));
    },
    CLEARALL(state) {
      delAllCookie();
      const locale = window.localStorage.getItem(Locale) || 'zh-Hans';
      window.localStorage.clear();
      state.JWT = null;
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
    CLEAR_PLUGINS_INTERVAL(state) {
      clearInterval(state.PluginsInterval);
      state.PluginsInterval = null;
    },
    CLEAR_VIRTUAL_SPACE(state) {
      window.localStorage.removeItem(VirtualSpaceStore);
      state.VirtualSpaceStore = [];
      state.EnvironmentFilter = null;
    },
    CLEAR_RESOURCE(state) {
      window.localStorage.removeItem(LatestCluster);
      clearInterval(state.PluginsInterval);
      state.PluginsInterval = null;
      state.LatestCluster = { cluster: '' };
    },
    CLEAR_TENANT(state) {
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
    CLEAR_RESOURCEIRONMENT(state) {
      window.localStorage.removeItem(EnvironmentStore);
      state.EnvironmentStore = [];
      clearInterval(state.PluginsInterval);
      state.Plugins = null;
    },
    CLEAR_CLUSTER(state) {
      window.localStorage.removeItem(ClusterStore);
      window.localStorage.removeItem(LatestCluster);
      state.ClusterStore = [];
      clearInterval(state.PluginsInterval);
      state.Plugins = null;
      state.LatestCluster = { cluster: '' };
    },
    SET_USER(state, user) {
      state.User = user;
      window.localStorage.setItem(User, JSON.stringify(user));
    },
    SET_USER_AUTH(state, auth) {
      state.Auth = auth;
      window.localStorage.setItem(Auth, JSON.stringify(auth));
    },
    SET_SIDEBAR_KEY(state) {
      state.SidebarKey = new Date().toJSON();
    },
    SET_VIRTUAL_SPACE(state, payload) {
      state.VirtualSpaceStore = payload;
      window.localStorage.setItem(VirtualSpaceStore, JSON.stringify(payload));
    },
    SET_CLUSTER(state, payload) {
      state.ClusterStore = payload;
      window.localStorage.setItem(ClusterStore, JSON.stringify(payload));
    },
    SET_TENANT(state, payload) {
      state.TenantStore = payload;
      window.localStorage.setItem(TenantStore, JSON.stringify(payload));
    },
    SET_PROJECT(state, payload) {
      state.ProjectStore = payload;
      window.localStorage.setItem(ProjectStore, JSON.stringify(payload));
    },
    SET_ENVIRONMENT(state, payload) {
      state.EnvironmentStore = payload;
      window.localStorage.setItem(EnvironmentStore, JSON.stringify(payload));
    },
  },
  actions: {
    async UPDATE_VIRTUALSPACE_DATA({ commit }) {
      const data = await getVirtualSpaceSelectData();
      commit('SET_VIRTUAL_SPACE', data);
    },
    async UPDATE_CLUSTER_DATA({ commit }) {
      const data = await getClusterSelectData();
      commit('SET_CLUSTER', data);
    },
    async UPDATE_TENANT_DATA({ state, commit }) {
      const data = await getTenantSelectData(state.Admin, state.User.ID);
      commit('SET_TENANT', data);
    },
    async UPDATE_PROJECT_DATA({ commit }, payload) {
      const data = await getProjectSelectData(payload);
      commit('SET_PROJECT', data);
    },
    async UPDATE_ENVIRONMENT_DATA({ commit }, payload) {
      const data = await getEnvironmentSelectData(payload);
      commit('SET_ENVIRONMENT', data);
    },
    async INIT_GLOBAL_PLUGINS({ state, commit }) {
      const doFunc = async () => {
        const data = await getPluginsList({
          noprocessing: true,
        });
        const p = {};
        data.forEach((d) => {
          p[d.name] = d.enabled;
        });
        commit('SET_GLOBAL_PLUGINS', p);
        return true;
      };
      if (!state.GlobalPluginsInterval && state.JWT) {
        const r = await doFunc();
        if (r) {
          state.GlobalPluginsInterval = setInterval(doFunc, 1000 * 30);
        }
      }
    },
    async INIT_PLUGINS({ state, getters, commit }, payload) {
      const doFunc = async () => {
        const cluster = payload;
        if (cluster && cluster.length > 0) {
          const data = await getClusterPluginsList(cluster, {
            simple: true,
            noprocessing: true,
          });
          commit('SET_PLUGINS', data);
          return true;
        }
        return false;
      };
      let refresh = false;
      if (state.AdminViewport && state.LatestCluster.cluster !== getters.Cluster().ClusterName) {
        refresh = true;
      } else if (!state.AdminViewport && state.LatestEnvironment.cluster !== getters.Environment().ClusterName) {
        refresh = true;
      }
      if ((!state.PluginsInterval && state.JWT) || refresh) {
        const r = await doFunc();
        if (r) {
          state.PluginsInterval = setInterval(doFunc, 1000 * 30);
        }
      }
    },
    async INIT_BROADCAST({ state, commit }) {
      const doFunc = async () => {
        const data = await getBroadcastlist({
          size: 1000,
          noprocessing: true,
          active: true,
        });
        const items = data.List;
        commit('SET_BROADCAST', items);
      };
      if (!state.BroadcastInterval && state.JWT) {
        const r = await doFunc();
        if (r) {
          state.BroadcastInterval = setInterval(doFunc, 1000 * 60);
        }
      }
    },
    async INIT_MESSAGE_STREAM({ state, dispatch }) {
      if (!state.MessageStreamWS && state.JWT) {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const host = window.location.host;
        const wsuri = `${protocol}://${host}/realtime/v2/msgbus/notify?token=${state.JWT}`;
        state.MessageStreamWS = new WebSocket(wsuri);
        state.MessageStreamWS.binaryType = 'arraybuffer';
        state.MessageStreamWS.onmessage = (e) => {
          state.MessageStream = e.data;
        };
        state.MessageStreamWS.onerror = async () => {
          if (state.MessageStreamWS) state.MessageStreamWS.close();
          state.MessageStreamWS = null;
          if (state.ReconnectCount <= 5) {
            await sleep(1000);
            dispatch('INIT_MESSAGE_STREAM');
            state.ReconnectCount += 1;
          }
        };
        state.MessageStreamWS.onclose = async () => {
          state.MessageStreamWS = null;
          if (state.ReconnectCount <= 5) {
            await sleep(1000);
            dispatch('INIT_MESSAGE_STREAM');
            state.ReconnectCount += 1;
          }
        };
      }
    },
    async LOAD_RESTMAPPING_RESOURCES({ commit }, payload) {
      if (!payload.clusterName) return;
      const data = await getRESTMapping(payload.clusterName);
      const resource = {};
      data.forEach((d) => {
        if (!d?.groupVersion.startsWith('apps.kruise.io')) {
          d?.resources?.forEach((r) => {
            resource[r.kind.toLocaleLowerCase()] = d.groupVersion;
          });
        }
      });
      commit('SET_API_RESOURCES', resource);
    },
  },
  getters: {
    VirtualSpace: (state) => () => {
      const store = state.VirtualSpaceStore;
      let virtualSpace = window.location.pathname.split('/')[3];
      if (router) {
        virtualSpace = router.history.current.params.virtualspace;
      }
      if (virtualSpace) {
        const space = store.find((v) => {
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
    Cluster: (state) => () => {
      const store = state.ClusterStore;
      let cluster = window.location.pathname.split('/')[2];
      if (router) {
        cluster = router.history.current.params.cluster;
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
    Tenant: (state) => () => {
      const store = state.TenantStore;
      let tenant = window.location.pathname.split('/')[2];
      if (router) {
        tenant = router.history.current.params.tenant;
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
    Project: (state) => () => {
      const store = state.ProjectStore;
      let project = window.location.pathname.split('/')[4];
      if (router) {
        project = router.history.current.params.project;
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
    Environment: (state) => () => {
      const store = state.EnvironmentStore;
      let environment = window.location.pathname.split('/')[6];
      if (router) {
        environment = router.history.current.params.environment || environment;
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
      };
    },
  },
});
