import { useGlobalI18n } from '@kubegems/extension/i18n';
import { useRouter } from '@kubegems/extension/router';
import { useStore } from '@kubegems/extension/store';
import { PLATFORM } from '@kubegems/libs/constants/platform';
import Vue from 'vue';

import { adminObserve } from './admin_observe';
import { adminWorkspace } from './admin_workspace';
import { appStore } from './app_store';
import { dashboard } from './dashboard';
import { entryMicroService } from './entry_microservice';
import { global } from './global';
import { microService } from './microservice';
import { modelStore } from './model_store';
import { observe } from './observe';
import { platform } from './platform';
import { projectWorkspace } from './project_workspace';
import { tool } from './tool';
import { userCenter } from './user_center';
import { workspace } from './workspace';

const store = useStore();
const router = useRouter();
const i18n = useGlobalI18n();

const originalRoutes = global
  .concat(platform) // 平台管理
  .concat(adminWorkspace) // 管理员工作台
  .concat(projectWorkspace) // 项目工作台
  .concat(workspace) // 租户工作台
  .concat(dashboard) // 首页
  .concat(adminObserve) // 管理员可观测性
  .concat(observe) // 租户可观测性
  .concat(entryMicroService) // 微服务入口
  .concat(microService) // 微服务工作台
  .concat(tool) // 租户工具箱
  .concat(appStore) // 应用商店
  .concat(userCenter) // 用户中心
  .concat(modelStore);

const rs = router.getRoutes();
originalRoutes.forEach((r) => {
  if (
    !rs.find((rr) => {
      return rr.name === r.name;
    })
  )
    router.addRoute(r);
});

router.beforeResolve((to, from, next): void => {
  if (window) {
    window.document.title = `${i18n.t(to.meta.title)} - ${PLATFORM}`;
  }
  next();
});

router.beforeEach(async (to, from, next): Promise<void> => {
  if (to.name === null) {
    next({ name: '404' });
    return;
  }
  if (to.meta.requireAuth && !store.state.JWT) {
    store.commit('SET_SNACKBAR', {
      text: Vue.prototype.$_i18n.t('tip.need_login'),
      color: 'warning',
    });
    next({ name: 'login', query: { redirect: to.fullPath } });
    return;
  } else {
    store.state.ReconnectCount = 0;
    store.dispatch('INIT_MESSAGE_STREAM');
    // 虚拟空间
    if (to.params.virtualspace && store.state.VirtualSpaceStore.length === 0) {
      await store.dispatch('UPDATE_VIRTUALSPACE_DATA');
    }
    // 集群
    if (to.params.cluster) {
      if (store.state.Admin) {
        store.commit('SET_ADMIN_VIEWPORT', true);
        if (store.state.ClusterStore.length === 0) {
          await store.dispatch('UPDATE_CLUSTER_DATA');
        }
        if (to.params.cluster !== store.state.LatestCluster.cluster) {
          await store.dispatch('LOAD_RESTMAPPING_RESOURCES', { clusterName: to.params.cluster });
        }
        await store.dispatch('INIT_PLUGINS', to.params.cluster);
        store.commit('SET_LATEST_CLUSTER', { cluster: to.params.cluster });
      }
    }
    let currentTenant: { [key: string]: string | number } = null;
    if (to.params.tenant) {
      if (store.state.TenantStore?.length === 0 || store.state.LatestTenant?.tenant !== to.params.tenant) {
        await store.dispatch('UPDATE_TENANT_DATA');
      }
      const tenant: { [key: string]: string | number } =
        store.state.TenantStore &&
        store.state.TenantStore.find((t) => {
          return t.TenantName === to.params.tenant;
        });
      if (!tenant) {
        next({ name: '403' });
        return;
      }
      store.commit('SET_LATEST_TENANT', { tenant: tenant.TenantName });
      currentTenant = tenant;
    }
    let currentProject: { [key: string]: string | number } = null;
    if (to.params.project) {
      if (store.state.ProjectStore?.length === 0 || store.state.LatestProject?.project !== to.params.project) {
        await store.dispatch('UPDATE_PROJECT_DATA', currentTenant.ID);
      }
      const project: { [key: string]: string | number } =
        store.state.ProjectStore &&
        store.state.ProjectStore.find((p) => {
          return p.ProjectName === to.params.project;
        });
      if (!project) {
        next({ name: '403' });
        return;
      }
      store.commit('SET_LATEST_PROJECT', { project: project.ProjectName });
      currentProject = project;
    }
    if (to.params.environment) {
      if (
        store.state.EnvironmentStore?.length === 0 ||
        store.state.LatestEnvironment?.environment !== to.params.environment
      ) {
        await store.dispatch('UPDATE_ENVIRONMENT_DATA', currentProject?.ID);
      }
      const environment: { [key: string]: string | number } =
        store.state.EnvironmentStore &&
        store.state.EnvironmentStore.find((e) => {
          return e.EnvironmentName === to.params.environment;
        });
      if (!environment) {
        next({ name: '403' });
        return;
      }
      if (
        (!store.state.Edge && environment.ClusterName !== store.state.LatestEnvironment.cluster) ||
        (store.state.Edge && store.state.Edge !== store.state.LatestEnvironment.cluster)
      ) {
        await store.dispatch('LOAD_RESTMAPPING_RESOURCES', { clusterName: environment?.ClusterName });
      }
      await store.dispatch('INIT_PLUGINS', store.state.Edge || environment?.ClusterName);
      store.commit('SET_LATEST_ENVIRONMENT', {
        environment: environment.EnvironmentName,
        cluster: store.state.Edge || environment.ClusterName,
      });
    }
    store.dispatch('INIT_GLOBAL_PLUGINS');
    if (store.state.AdminViewport && to.meta.upToAdmin) {
      next({
        name: `admin-${to.name}`,
        params: {
          ...to.params,
          cluster: store.getters.Cluster.ClusterName || from.params.cluster,
        },
        query: { ...to.query },
      });
    } else {
      next();
    }
  }
});

export const useRoutes = () => {
  return originalRoutes;
};

export default router;
