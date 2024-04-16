import { getClusterPluginsList, getPluginsList, getRESTMapping } from '@kubegems/api/direct';
import { sleep } from '@kubegems/libs/utils/helpers';
import { ActionContext } from 'vuex';

import router from '../../../router';
import { useCluster, useEnvironment, useProject, useTenant, useVirtualSpace } from '../api';

const TenantStore = 'tenantstore';
const ProjectStore = 'projectstore';
const EnvironmentStore = 'environmentstore';
const ClusterStore = 'clusterstore';
const Plugins = 'plugins';
const GlobalPlugins = 'globalplugins';
const VirtualSpaceStore = 'virtualspacestore';
const LatestTenant = 'latesttenant';
const LatestProject = 'latestproject';
const LatestEnvironment = 'latestenvironment';
const LatestCluster = 'latestcluster';
const ApiResources = 'api-resources';

const resource = {
  state: {
    MessageStreamWS: null,
    MessageStream: null,
    ReconnectCount: 0,
    PluginsInterval: null,
    GlobalPluginsInterval: null,
    Plugins: JSON.parse(window.localStorage.getItem(Plugins) as string) || {},
    GlobalPlugins: JSON.parse(window.localStorage.getItem(GlobalPlugins) as string) || {},
    VirtualSpaceStore: JSON.parse(window.localStorage.getItem(VirtualSpaceStore) as string) || [],
    ClusterStore: JSON.parse(window.localStorage.getItem(ClusterStore) as string) || [],
    TenantStore: JSON.parse(window.localStorage.getItem(TenantStore) as string) || [],
    ProjectStore: JSON.parse(window.localStorage.getItem(ProjectStore) as string) || [],
    EnvironmentStore: JSON.parse(window.localStorage.getItem(EnvironmentStore) as string) || [],
    EnvironmentFilter: null,
    LatestTenant: JSON.parse(window.localStorage.getItem(LatestTenant) as string) || {
      tenant: '',
    },
    LatestProject: JSON.parse(window.localStorage.getItem(LatestProject) as string) || {
      project: '',
    },
    LatestEnvironment: JSON.parse(window.localStorage.getItem(LatestEnvironment) as string) || {
      environment: '',
      cluster: '',
    },
    LatestCluster: JSON.parse(window.localStorage.getItem(LatestCluster) as string) || {
      cluster: '',
    },
    ApiResources: JSON.parse(window.localStorage.getItem(ApiResources) as string) || {},
  },
  mutations: {
    SET_PLUGINS(state: { [key: string]: any }, payload: { [key: string]: any }[]): void {
      state.Plugins = payload;
      window.localStorage.setItem(Plugins, JSON.stringify(payload));
    },
    SET_GLOBAL_PLUGINS(state: { [key: string]: any }, payload: { [key: string]: any }[]): void {
      state.GlobalPlugins = payload;
      window.localStorage.setItem(GlobalPlugins, JSON.stringify(payload));
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

    SET_API_RESOURCES(state: { [key: string]: any }, payload: { [key: string]: any }): void {
      state.ApiResources = payload;
      window.localStorage.setItem(ApiResources, JSON.stringify(payload));
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
        data?.forEach((d) => {
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
        (!state.AdminViewport &&
          state.LatestEnvironment.cluster !== getters.Environment().ClusterName &&
          !state.Edge) ||
        (state.Edge && state.LatestEnvironment.cluster !== state.Edge)
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
        state.MessageStreamWS.onclose = async (): Promise<void> => {
          if (state.MessageStreamWS) state.MessageStreamWS.close();
          state.MessageStreamWS = null;
          if (state.ReconnectCount < 5) {
            console.log(`message stream ws reconnecting..., ${(state.ReconnectCount + 1) * 2}s retry`);
            await sleep(1000 * (state.ReconnectCount + 1) * 2);
            dispatch('INIT_MESSAGE_STREAM');
            state.ReconnectCount += 1;
          }
        };
        state.MessageStreamWS.onopen = async (): Promise<void> => {
          const _time = setInterval(() => {
            if (state.MessageStreamWS) state.MessageStreamWS.send(JSON.stringify({ kind: 'keep-alive' }));
            else clearInterval(_time);
          }, 5 * 1000);
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
      const data: { [key: string]: any } = await getRESTMapping(payload.clusterName, { noprocessing: true });
      const resource: { [key: string]: string } = {};
      data?.forEach((d) => {
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
        const space: any = store.find((v) => {
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
};

export default resource;
