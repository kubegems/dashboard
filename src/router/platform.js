export const platform = [
  {
    path: '/platform',
    name: 'platform',
    component: () => import('@/layouts/Layout'),
    redirect: { name: 'base-setting' },
    children: [
      {
        path: '',
        meta: {
          header: '基本配置',
          title: '基本配置',
          icon: 'mdi-brightness-7',
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: `base-setting` },
        children: [
          {
            path: 'base',
            name: `base-setting`,
            component: () => import('@/views/setting/base/index'),
            meta: {
              requireAuth: true,
              admin: true,
              title: '基本配置',
              icon: 'mdi-brightness-7',
              show: true,
              rootName: 'platform',
              dependencies: ['kubegems-installer'],
              tip: 'base-setting',
            },
          },
        ],
      },
      {
        path: '',
        meta: {
          header: '租户',
          title: '租户管理',
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
              title: '租户',
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
              title: '租户',
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
              title: '用户',
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
              title: '角色',
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
          header: '空间',
          title: '空间管理',
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
              title: '项目',
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
              title: '环境',
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
          header: '安全配置',
          title: '安全',
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
              title: '审计',
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
              title: '事件',
              icon: 'mdi-bell',
              show: true,
              rootName: 'platform',
              tip: 'event',
              dependencies: ['logging', 'eventer'],
            },
          },
        ],
      },
      {
        path: '',
        meta: {
          header: '集成',
          title: '集成',
          icon: 'mdi-hexagon-multiple',
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: 'repository-list' },
        children: [
          // 认证
          {
            path: 'oauth',
            name: 'oauth-setting',
            component: () => import('@/views/setting/oauth/index'),
            meta: {
              requireAuth: true,
              title: '认证',
              icon: 'mdi-star',
              show: true,
              rootName: 'platform',
              tip: 'auth-setting',
            },
          },
          // 应用仓库
          {
            path: 'repositories',
            name: 'repository-list',
            component: () => import('@/views/appstore/list'),
            meta: {
              requireAuth: true,
              title: '应用商店仓库',
              icon: 'mdi-shopping',
              show: true,
              rootName: 'platform',
              tip: 'appstore-registry',
            },
          },
          // prometheus
          {
            path: 'prometheus/templates',
            name: 'prometheus-template-list',
            component: () => import('@/views/setting/prometheus/index'),
            meta: {
              requireAuth: true,
              title: 'Prometheus模版',
              icon: 'mdi-file-powerpoint-box',
              show: true,
              rootName: 'platform',
              tip: 'prometheus-setting',
            },
          },
        ],
      },
    ],
  },
]
