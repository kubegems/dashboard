const namePrefix = 'admin'

export const adminObserve = [
  {
    path: '/admin-observe',
    name: 'admin-observe',
    component: () => import('@/layouts/Layout'),
    redirect: { name: 'admin-log-viewer' },
    children: [
      /**
       * 日志
       */
      {
        path: 'log',
        meta: {
          header: '日志',
          title: '日志',
          icon: 'mdi-math-log',
          dependencies: ['logging', 'loki'],
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: 'admin-log-viewer' },
        children: [
          // viewer
          {
            path: `viewer`,
            name: `${namePrefix}-log-viewer`,
            component: () => import('@/views/observe/log/viewer/viewer'),
            meta: {
              requireAuth: true,
              title: '日志查看器',
              admin: true,
              icon: 'mdi-format-list-bulleted',
              show: true,
              rootName: 'admin-observe',
            },
          },
          {
            path: `snapshot`,
            name: `${namePrefix}-log-snapshot`,
            component: () => import('@/views/observe/log/snapshot'),
            meta: {
              requireAuth: true,
              title: '日志快照',
              admin: true,
              icon: 'mdi-camera',
              show: true,
              rootName: 'admin-observe',
            },
          },
          {
            path: 'flow',
            name: `${namePrefix}-log-flow`,
            component: () => import('@/views/observe/log/operator/flow'),
            meta: {
              requireAuth: true,
              title: '日志采集器',
              admin: true,
              icon: 'mdi-arrange-send-backward',
              show: true,
              rootName: 'admin-observe',
            },
          },
          {
            path: 'flow/:name',
            name: `${namePrefix}-log-flow-detail`,
            component: () => import('@/views/observe/log/operator/flow/detail'),
            meta: {
              requireAuth: true,
              title: '日志采集器',
              admin: true,
              icon: 'mdi-arrange-send-backward',
              show: false,
              rootName: 'admin-observe',
            },
          },
          {
            path: 'output',
            name: `${namePrefix}-log-output`,
            component: () => import('@/views/observe/log/operator/output'),
            meta: {
              requireAuth: true,
              title: '日志路由器',
              admin: true,
              icon: 'mdi-router-wireless',
              show: true,
              rootName: 'admin-observe',
            },
          },
          {
            path: 'output/:name',
            name: `${namePrefix}-log-output-detail`,
            component: () => import('@/views/observe/log/operator/output/detail'),
            meta: {
              requireAuth: true,
              title: '日志路由器',
              admin: true,
              icon: 'mdi-router-wireless',
              show: false,
              rootName: 'admin-observe',
            },
          },
        ],
      },
      /**
       * 监控指标
       */
      {
        path: 'metrics',
        meta: {
          header: '指标',
          title: '监控指标',
          icon: 'mdi-chart-bell-curve-cumulative',
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: 'admin-observe-metrics-queryer' },
        children: [
          {
            path: 'queryer',
            name: `${namePrefix}-observe-metrics-queryer`,
            component: () => import('@/views/observe/metrics/queryer'),
            meta: {
              requireAuth: true,
              title: '指标查询器',
              admin: true,
              icon: 'mdi-feature-search-outline',
              show: true,
              rootName: 'admin-observe',
            },
          },
          {
            path: 'targets',
            name: `${namePrefix}-observe-metrics-targets`,
            component: () => import('@/views/observe/metrics/targets'),
            meta: {
              requireAuth: true,
              title: '监控采集器',
              admin: true,
              icon: 'mdi-eyedropper',
              show: true,
              rootName: 'admin-observe',
            },
          },
        ],
      },
      /**
       * 监控告警
       */
      {
        path: 'alert',
        meta: {
          header: '告警',
          title: '监控告警',
          icon: 'mdi-monitor',
          dependencies: ['alertmanager', 'prometheus'],
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: 'admin-observe-alert-history' },
        children: [
          {
            path: 'history',
            name: `${namePrefix}-observe-alert-history`,
            component: () => import('@/views/observe/alert/history'),
            meta: {
              requireAuth: true,
              title: '告警历史',
              admin: true,
              icon: 'mdi-history',
              show: true,
              rootName: 'admin-observe',
            },
          },
          {
            path: 'blacklist',
            name: `${namePrefix}-observe-alert-blacklist`,
            component: () => import('@/views/observe/alert/blacklist'),
            meta: {
              requireAuth: true,
              title: '告警黑名单',
              admin: true,
              icon: 'mdi-history',
              show: true,
              rootName: 'admin-observe',
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
        redirect: { name: 'admin-observe-trace-search' },
        children: [
          {
            path: 'search',
            name: `${namePrefix}-observe-trace-search`,
            component: () => import('@/views/observe/trace'),
            meta: {
              requireAuth: true,
              title: '查询',
              admin: true,
              icon: 'mdi-feature-search-outline',
              show: true,
              rootName: 'admin-observe',
            },
          },
          {
            path: 'detail',
            name: `${namePrefix}-observe-trace-detail`,
            component: () => import('@/views/observe/trace/detail'),
            meta: {
              requireAuth: true,
              title: 'TraceId',
              admin: true,
              icon: 'mdi-details',
              show: true,
              rootName: 'admin-observe',
            },
          },
        ],
      },
    ],
  },
]
