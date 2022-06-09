import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'

import { global } from './global'
import { platform } from './platform'
import { adminWorkspace } from './admin_workspace'
import { appStore } from './app_store'
import { adminObserve } from './admin_observe'
import { microService } from './microservice'
import { workspace } from './workspace'
import { observe } from './observe'
import { tool } from './tool'
import { userCenter } from './user_center'
import { projectWorkspace } from './project_workspace'
import { entryMicroService } from './entry_microservice'
import { dashboard } from './dashboard'

const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err)
}

const originalReplace = Router.prototype.replace
Router.prototype.replace = function replace(location) {
  return originalReplace.call(this, location).catch((err) => err)
}

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: global
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
    .concat(userCenter), // 用户中心
})

router.beforeEach(async (to, from, next) => {
  if (to.name === null) {
    next({ name: '404' })
    return
  }
  if (to.meta.requireAuth && !store.state.JWT) {
    store.commit('SET_SNACKBAR', {
      text: '请登录后访问',
      color: 'warning',
    })
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  } else {
    store.state.ReconnectCount = 0
    store.dispatch('INIT_MESSAGE_STREAM')
    // 虚拟空间
    if (to.params.virtualspace && store.state.VirtualSpaceStore.length === 0) {
      await store.dispatch('UPDATE_VIRTUALSPACE_DATA')
    }
    // 集群
    if (
      (to.params.cluster)
    ) {
      if (store.state.Admin) {
        store.commit('SET_ADMIN_VIEWPORT', true)
        if (store.state.ClusterStore.length === 0) {
          await store.dispatch('UPDATE_CLUSTER_DATA')
        }
        if (to.params.cluster !== store.state.LatestCluster.cluster) {
          store.dispatch('LOAD_RESTMAPPING_RESOURCES', { clusterName: to.params.cluster })
        }
        store.commit('SET_LATEST_CLUSTER', { cluster: to.params.cluster })
      }
    }
    let currentTenant = null
    if (to.params.tenant) {
      if (
        store.state.TenantStore.length === 0 ||
        store.state.LatestTenant.tenant !== to.params.tenant
      ) {
        await store.dispatch('UPDATE_TENANT_DATA')
      }
      const tenant =
        store.state.TenantStore &&
        store.state.TenantStore.find((t) => {
          return t.TenantName === to.params.tenant
        })
      if (!tenant) {
        next({ name: '403' })
        return
      }
      store.commit('SET_LATEST_TENANT', { tenant: tenant.TenantName })
      currentTenant = tenant
    }
    let currentProject = null
    if (to.params.project) {
      if (
        store.state.ProjectStore.length === 0 ||
        store.state.LatestProject.project !== to.params.project
      ) {
        await store.dispatch('UPDATE_PROJECT_DATA', currentTenant.ID)
      }
      const project =
        store.state.ProjectStore &&
        store.state.ProjectStore.find((p) => {
          return p.ProjectName === to.params.project
        })
      if (!project) {
        next({ name: '403' })
        return
      }
      store.commit('SET_LATEST_PROJECT', { project: project.ProjectName })
      currentProject = project
    }
    if (to.params.environment) {
      if (
        store.state.EnvironmentStore.length === 0 ||
        store.state.LatestEnvironment.environment !== to.params.environment
      ) {
        await store.dispatch('UPDATE_ENVIRONMENT_DATA', currentProject.ID)
      }
      const environment =
        store.state.EnvironmentStore &&
        store.state.EnvironmentStore.find((e) => {
          return e.EnvironmentName === to.params.environment
        })
      if (!environment) {
        next({ name: '403' })
        return
      }
      if (environment.ClusterName !== store.state.LatestEnvironment.cluster) {
        store.dispatch('LOAD_RESTMAPPING_RESOURCES', { clusterName: environment?.ClusterName })
      }
      store.commit('SET_LATEST_ENVIRONMENT', {
        environment: environment.EnvironmentName,
        cluster: environment.ClusterName,
      })
    }
    store.dispatch('INIT_PLUGINS')
    if (store.state.AdminViewport && to.meta.upToAdmin) {
      next({
        name: `admin-${to.name}`,
        params: {
          ...to.params,
          cluster: store.getters.Cluster.ClusterName || from.params.cluster,
        },
        query: { ...to.query },
      })
    } else {
      next()
    }
  }
})

export default router
