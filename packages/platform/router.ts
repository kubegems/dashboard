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
import { RouteConfig } from 'vue-router';

export const platform: RouteConfig[] = [
  {
    path: '',
    meta: {
      header: 'routerbar.administration.h_tenant',
      title: 'routerbar.administration.g_tenant',
      icon: 'mdi-account-settings',
    },
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: 'tenant-list' },
    children: [
      // tenant
      {
        path: 'tenants',
        name: 'tenant-list',
        component: () => import('./views/tenant/tenant/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.administration.tenant',
          admin: true,
          icon: 'mdi-account-switch',
          show: true,
          rootName: 'platform',
          tip: 'tenant',
        },
      },
      {
        path: 'tenants/:name',
        name: 'tenant-detail',
        component: () => import('./views/tenant/tenant/detail.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.administration.user',
          admin: true,
          icon: 'mdi-account-switch',
          show: false,
          rootName: 'platform',
          tip: 'tenant',
        },
      },
      // user
      {
        path: 'users',
        name: 'user-list',
        component: () => import('./views/tenant/user/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.administration.user',
          admin: true,
          icon: 'mdi-account',
          show: true,
          rootName: 'platform',
          tip: 'user',
        },
      },
      // role
      {
        path: 'roles',
        name: 'role-list',
        component: () => import('./views/tenant/role/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.administration.role',
          admin: true,
          icon: 'mdi-ticket-account',
          show: true,
          rootName: 'platform',
          tip: 'role',
        },
      },
    ],
  },
  {
    path: '',
    meta: {
      header: 'routerbar.administration.h_space',
      title: 'routerbar.administration.g_space',
      icon: 'mdi-checkbox-multiple-blank',
    },
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: 'platform-project-list' },
    children: [
      // project
      {
        path: `projects`,
        name: 'platform-project-list',
        component: () => import('./views/project/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.administration.project',
          admin: true,
          icon: 'mdi-cube-outline',
          show: true,
          rootName: 'platform',
          tip: 'project',
        },
      },
      // environment
      {
        path: `environments`,
        name: 'platform-environment-list',
        component: () => import('./views/environment/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.administration.environment',
          admin: true,
          icon: 'mdi-cloud',
          show: true,
          rootName: 'platform',
          tip: 'environment',
        },
      },
    ],
  },
  {
    path: '',
    meta: {
      header: 'routerbar.administration.h_integrated',
      title: 'routerbar.administration.g_integrated',
      icon: 'mdi-hexagon-multiple',
    },
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: 'auth-setting' },
    children: [
      // 认证
      {
        path: 'oauth',
        name: 'oauth-setting',
        component: () => import('./views/setting/oauth/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.administration.authorization',
          icon: 'mdi-star',
          show: true,
          rootName: 'platform',
          tip: 'auth_setting',
        },
      },
    ],
  },
  {
    path: '',
    meta: {
      title: 'routerbar.administration.g_notice',
      icon: 'mdi-bulletin-board',
    },
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: 'broadcast-list' },
    children: [
      {
        path: 'broadcasts',
        name: 'broadcast-list',
        component: () => import('./views/setting/broadcast/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.administration.broadcast',
          icon: 'mdi-broadcast',
          show: true,
          rootName: 'platform',
          tip: 'broadcast',
        },
      },
    ],
  },
];
