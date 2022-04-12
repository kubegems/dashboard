const prefix = 'admin'

export const adminObserve = [
  {
    path: '/admin-observe',
    name: 'admin-observe',
    component: () => import('@/layouts/Layout'),
    redirect: { name: 'observe-overview' },
    children: [
      // overview
      {
        path: '',
        meta: {
          header: '概览',
          title: '概览',
          icon: 'mdi-tablet-dashboard',
          show: true,
        },
        redirect: { name: `${prefix}-observe-overview` },
        component: () => import('@/layouts/Container'),
        children: [
          {
            path: `overview`,
            name: `${prefix}-observe-overview`,
            component: () => import('@/views/observe/overview'),
            meta: {
              requireAuth: true,
              title: '概览',
              admin: true,
              icon: 'mdi-home',
              show: true,
              rootName: 'admin-observe',
            },
          },
        ],
      },

      /**
       * 监控中心
       */
      {
        path: 'monitor',
        meta: {
          header: '监控',
          title: '监控中心',
          icon: 'mdi-monitor-eye',
          show: true,
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: `${prefix}-observe-monitor-overview` },
        children: [
          {
            path: `overview`,
            name: `${prefix}-observe-monitor-overview`,
            component: () => import('@/views/observe/monitor/overview'),
            meta: {
              requireAuth: true,
              title: '概览',
              admin: true,
              icon: 'mdi-monitor-dashboard',
              show: true,
              rootName: 'admin-observe',
            },
          },
          {
            path: `config`,
            name: `${prefix}-observe-monitor-config`,
            component: () => import('@/views/observe/monitor/config'),
            meta: {
              requireAuth: true,
              title: '配置',
              admin: true,
              icon: 'mdi-format-list-bulleted',
              show: true,
              rootName: 'admin-observe',
            },
          },
          {
            path: `config/detail/servicemonitor/:name`,
            name: `${prefix}-servicemonitor-detail`,
            component: () => import('@/views/observe/monitor/config/servicemonitor/detail'),
            meta: {
              requireAuth: true,
              title: '监控采集器',
              admin: true,
              icon: 'mdi-eyedropper',
              show: false,
              rootName: 'admin-observe',
            },
          },
          {
            path: `config/detail/prometheus-rule/:name`,
            name: `${prefix}-prometheusrule-detail`,
            component: () => import('@/views/observe/monitor/config/prometheusrule/detail'),
            meta: {
              requireAuth: true,
              title: '告警规则',
              admin: true,
              icon: 'mdi-ruler',
              show: false,
              rootName: 'admin-observe',
            },
          },
          {
            path: `metrics`,
            name: `${prefix}-observe-monitor-metrics`,
            component: () => import('@/views/observe/monitor/metrics'),
            meta: {
              requireAuth: true,
              title: '指标查询',
              admin: true,
              icon: 'mdi-feature-search-outline',
              show: true,
              rootName: 'admin-observe',
            },
          },
          {
            path: `history`,
            name: `${prefix}-observe-alert-history`,
            component: () => import('@/views/observe/monitor/history'),
            meta: {
              requireAuth: true,
              title: '告警历史',
              admin: true,
              icon: 'mdi-history',
              show: true,
              rootName: 'admin-observe',
              dependencies: ['monitoring'],
            },
          },
          {
            path: `blacklist`,
            name: `${prefix}-observe-alert-blacklist`,
            component: () => import('@/views/observe/monitor/blacklist'),
            meta: {
              requireAuth: true,
              title: '告警黑名单',
              admin: true,
              icon: 'mdi-playlist-remove',
              show: true,
              rootName: 'admin-observe',
              dependencies: ['monitoring'],
            },
          },
        ],
      },

      {
        path: 'log',
        meta: {
          header: '日志',
          title: '日志中心',
          icon: 'mdi-math-log',
          dependencies: ['logging'],
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: `${prefix}-log-viewer` },
        children: [
          // viewer
          {
            path: `viewer`,
            name: `${prefix}-log-viewer`,
            component: () => import('@/views/observe/log/viewer/index'),
            meta: {
              requireAuth: true,
              title: '日志查看器',
              admin: true,
              icon: 'mdi-format-list-bulleted',
              show: true,
              rootName: 'admin-observe',
              dependencies: ['logging'],
            },
          },
          {
            path: `config`,
            name: `${prefix}-log-config`,
            component: () => import('@/views/observe/log/config'),
            meta: {
              requireAuth: true,
              title: '配置',
              admin: true,
              icon: 'mdi-arrange-send-backward',
              show: true,
              rootName: 'admin-observe',
              dependencies: ['logging'],
            },
          },
          {
            path: `snapshot`,
            name: `${prefix}-log-snapshot`,
            component: () => import('@/views/observe/log/snapshot'),
            meta: {
              requireAuth: true,
              title: '快照',
              admin: true,
              icon: 'mdi-camera',
              show: true,
              rootName: 'admin-observe',
              dependencies: ['logging'],
            },
          },
          {
            path: `config/flow-detail/:kind/:name`,
            name: `${prefix}-log-flow-detail`,
            component: () => import('@/views/observe/log/config/flow/detail'),
            meta: {
              requireAuth: true,
              title: '日志采集器详情',
              admin: true,
              icon: 'mdi-arrange-send-backward',
              show: false,
              rootName: 'admin-observe',
              dependencies: ['logging'],
            },
          },
          {
            path: `config/output-detail/:kind/:name`,
            name: `${prefix}-log-output-detail`,
            component: () => import('@/views/observe/log/config/output/detail'),
            meta: {
              requireAuth: true,
              title: '日志路由器详情',
              admin: true,
              icon: 'mdi-router-wireless',
              show: false,
              rootName: 'admin-observe',
              dependencies: ['logging'],
            },
          },
        ],
      },
      /**
       * 链路追踪
       */
      {
        path: 'trace',
        meta: {
          header: '链路追踪',
          title: '链路追踪',
          icon: 'mdi-link-variant',
          dependencies: ['jaeger'],
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: `${prefix}-observe-trace-search` },
        children: [
          {
            path: `search`,
            name: `${prefix}-observe-trace-search`,
            component: () => import('@/views/observe/trace'),
            meta: {
              requireAuth: true,
              title: '查询',
              admin: true,
              icon: 'mdi-feature-search-outline',
              show: true,
              rootName: 'admin-observe',
              dependencies: ['jaeger'],
            },
          },
          {
            path: `detail`,
            name: `${prefix}-observe-trace-detail`,
            component: () => import('@/views/observe/trace/detail'),
            meta: {
              requireAuth: true,
              title: 'TraceId',
              admin: true,
              icon: 'mdi-details',
              show: true,
              rootName: 'admin-observe',
              dependencies: ['jaeger'],
            },
          },
        ],
      },
    ],
  },
]
