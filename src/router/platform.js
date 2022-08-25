export const platform = [
  {
    path: '/platform',
    name: 'platform',
    component: () => import('@/layouts/Layout'),
    redirect: { name: 'tenant-list' },
    children: [
      {
        path: '',
        meta: {
          header: 'routerbar.administration.h_tenant',
          title: 'routerbar.administration.g_tenant',
          icon: 'mdi-account-settings',
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: 'tenant-list' },
        children: [
          // tenant
          {
            path: 'tenants',
            name: 'tenant-list',
            component: () => import('@/views/tenant/tenant/index'),
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
            component: () => import('@/views/tenant/tenant/detail'),
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
            component: () => import('@/views/tenant/user/index'),
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
            component: () => import('@/views/tenant/role/index'),
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
        component: () => import('@/layouts/Container'),
        redirect: { name: 'platform-project-list' },
        children: [
          // project
          {
            path: `projects`,
            name: 'platform-project-list',
            component: () => import('@/views/resource/project/index'),
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
            component: () => import('@/views/resource/environment/index'),
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
          header: 'routerbar.administration.h_security',
          title: 'routerbar.administration.g_security',
          icon: 'mdi-security',
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: `admin-audit-list` },
        children: [
          // 审计
          {
            path: 'audits',
            name: `admin-audit-list`,
            component: () => import('@/views/tool/audit/index'),
            meta: {
              requireAuth: true,
              admin: true,
              title: 'routerbar.administration.audit',
              icon: 'mdi-history',
              show: true,
              rootName: 'platform',
              tip: 'audit',
            },
          },
          // 事件
          {
            path: 'events',
            name: `admin-event-list`,
            component: () => import('@/views/tool/event/index'),
            meta: {
              requireAuth: true,
              admin: true,
              title: 'routerbar.administration.event',
              icon: 'mdi-bell',
              show: true,
              rootName: 'platform',
              tip: 'event',
              dependencies: ['logging', 'eventer'],
              innerCheck: true,
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
        component: () => import('@/layouts/Container'),
        redirect: { name: 'auth-setting' },
        children: [
          // 认证
          {
            path: 'oauth',
            name: 'oauth-setting',
            component: () => import('@/views/setting/oauth/index'),
            meta: {
              requireAuth: true,
              title: 'routerbar.administration.authorization',
              icon: 'mdi-star',
              show: true,
              rootName: 'platform',
              tip: 'auth_setting',
            },
          },
          // 应用仓库
          {
            path: 'app/repositories',
            name: 'app-repository-list',
            component: () => import('@/views/appstore/list'),
            meta: {
              requireAuth: true,
              title: 'routerbar.administration.app_store',
              icon: 'mdi-shopping',
              show: true,
              rootName: 'platform',
              tip: 'appstore_registry',
            },
          },
          // 模型商店仓库
          {
            path: 'model/repositories',
            name: 'model-repository-list',
            component: () => import('@/views/setting/model_registry/index'),
            meta: {
              requireAuth: true,
              title: 'routerbar.administration.model_store',
              icon: 'mdi-cube',
              show: true,
              rootName: 'platform',
              tip: 'modelstore_registry',
            },
          },
          {
            path: 'model/repositories/:name',
            name: 'model-repository-detail',
            component: () => import('@/views/setting/model_registry/detail'),
            meta: {
              requireAuth: true,
              title: 'routerbar.administration.model_store',
              icon: 'mdi-cube',
              rootName: 'platform',
              tip: 'modelstore_registry',
            },
          },
        ],
      },
      {
        path: '',
        meta: {
          title: 'routerbar.administration.g_template',
          icon: 'mdi-widgets',
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: 'repository-list' },
        children: [
          // prometheus
          {
            path: 'prometheus/templates',
            name: 'prometheus-template-list',
            component: () => import('@/views/setting/prometheus/index'),
            meta: {
              requireAuth: true,
              title: 'routerbar.administration.prometheus_template',
              icon: 'mdi-file-powerpoint-box',
              show: true,
              rootName: 'platform',
              tip: 'prometheus_setting',
            },
          },
          {
            path: 'monitor/templates',
            name: 'monitor-template-list',
            component: () => import('@/views/setting/monitor/index'),
            meta: {
              requireAuth: true,
              title: 'routerbar.administration.monitor_template',
              icon: 'mdi-format-size',
              show: true,
              rootName: 'platform',
              tip: 'monitor_template',
            },
          },
          {
            path: 'monitor/templates/:name',
            name: 'monitor-template-detail',
            component: () => import('@/views/setting/monitor/detail'),
            meta: {
              requireAuth: true,
              title: 'routerbar.administration.monitor_template',
              icon: 'mdi-format-size',
              show: false,
              rootName: 'platform',
              tip: 'monitor_template',
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
        component: () => import('@/layouts/Container'),
        redirect: { name: 'broadcast-list' },
        children: [
          {
            path: 'broadcasts',
            name: 'broadcast-list',
            component: () => import('@/views/setting/broadcast/index'),
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
    ],
  },
];
