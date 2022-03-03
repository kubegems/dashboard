const prefix = ':tenant'

export const observe = [
  {
    path: '/observe',
    name: 'observe',
    component: () => import('@/layouts/Layout'),
    redirect: { name: 'observe-overview' },
    children: [
      // overview
      {
        path: 'overview',
        meta: {
          header: '概览',
          title: '概览',
          icon: 'mdi-tablet-dashboard',
          show: true,
        },
        redirect: { name: 'observe-overview' },
        component: () => import('@/layouts/Container'),
        children: [
          {
            path: `${prefix}/overview`,
            name: 'observe-overview',
            component: () => import('@/views/observe/overview'),
            meta: {
              requireAuth: true,
              title: '概览',
              upToAdmin: true,
              icon: 'mdi-home',
              show: true,
              rootName: 'observe',
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
        redirect: { name: 'log-viewer' },
        children: [
          {
            path: `${prefix}/overview`,
            name: 'observe-monitor-overview',
            component: () => import('@/views/observe/monitor/overview'),
            meta: {
              requireAuth: true,
              title: '概览',
              upToAdmin: true,
              icon: 'mdi-monitor-dashboard',
              show: true,
              rootName: 'observe',
            },
          },
          {
            path: `${prefix}/config`,
            name: 'observe-monitor-config',
            component: () => import('@/views/observe/monitor/config'),
            meta: {
              requireAuth: true,
              title: '配置',
              upToAdmin: true,
              icon: 'mdi-format-list-bulleted',
              show: true,
              rootName: 'observe',
            },
          },
          {
            path: `${prefix}/config/detail/servicemonitor/:name`,
            name: 'observe-monitor-config-servicemonitor-detail',
            component: () => import('@/views/observe/monitor/config/servicemonitor'),
            meta: {
              requireAuth: true,
              title: '监控采集器',
              upToAdmin: true,
              icon: 'mdi-eyedropper',
              show: false,
              rootName: 'observe',
            },
          },
          {
            path: `${prefix}/metrics`,
            name: 'observe-monitor-metrics',
            component: () => import('@/views/observe/monitor/metrics'),
            meta: {
              requireAuth: true,
              title: '指标查询',
              upToAdmin: true,
              icon: 'mdi-feature-search-outline',
              show: true,
              rootName: 'observe',
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
          required: ['tenant'],
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: 'log-viewer' },
        children: [
          // viewer
          {
            path: `${prefix}/viewer`,
            name: 'log-viewer',
            component: () => import('@/views/observe/log/viewer/index'),
            meta: {
              requireAuth: true,
              title: '日志查看器',
              upToAdmin: true,
              icon: 'mdi-format-list-bulleted',
              show: true,
              rootName: 'observe',
              dependencies: ['logging'],
            },
          },
          {
            path: `${prefix}/snapshot`,
            name: 'log-snapshot',
            component: () => import('@/views/observe/log/snapshot'),
            meta: {
              requireAuth: true,
              title: '日志快照',
              upToAdmin: true,
              icon: 'mdi-camera',
              show: true,
              rootName: 'observe',
              dependencies: ['logging'],
            },
          },
          {
            path: `${prefix}/config`,
            name: 'log-config',
            component: () => import('@/views/observe/log/config'),
            meta: {
              requireAuth: true,
              title: '采集配置',
              upToAdmin: true,
              icon: 'mdi-arrange-send-backward',
              show: true,
              rootName: 'observe',
              dependencies: ['logging'],
            },
          },
          {
            path: `${prefix}/config/flow-detail/:kind/:name`,
            name: 'log-flow-detail',
            component: () => import('@/views/observe/log/config/flow/detail'),
            meta: {
              requireAuth: true,
              title: '日志采集器详情',
              upToAdmin: true,
              icon: 'mdi-arrange-send-backward',
              show: false,
              rootName: 'observe',
              dependencies: ['logging'],
            },
          },
          {
            path: `${prefix}/config/output-detail/:kind/:name`,
            name: 'log-output-detail',
            component: () => import('@/views/observe/log/config/output/detail'),
            meta: {
              requireAuth: true,
              title: '日志路由器详情',
              upToAdmin: true,
              icon: 'mdi-router-wireless',
              show: false,
              rootName: 'observe',
              dependencies: ['logging'],
            },
          },
        ],
      },
      /*
       * 监控指标
       */
      {
        path: 'metrics',
        meta: {
          header: '指标',
          title: '监控指标',
          icon: 'mdi-chart-bell-curve-cumulative',
          dependencies: ['monitoring'],
          required: ['tenant'],
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: 'observe-metrics-queryer' },
        children: [
          {
            path: `${prefix}/queryer`,
            name: `observe-metrics-queryer`,
            component: () => import('@/views/observe/metrics/queryer'),
            meta: {
              requireAuth: true,
              title: '指标查询器',
              upToAdmin: true,
              icon: 'mdi-feature-search-outline',
              show: true,
              rootName: 'observe',
              dependencies: ['monitoring'],
            },
          },
          {
            path: `${prefix}/targets`,
            name: `observe-metrics-targets`,
            component: () => import('@/views/observe/metrics/targets'),
            meta: {
              requireAuth: true,
              title: '监控采集器',
              upToAdmin: true,
              icon: 'mdi-eyedropper',
              show: true,
              rootName: 'observe',
              dependencies: ['monitoring'],
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
          dependencies: ['monitoring'],
          required: ['tenant'],
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: 'observe-alert-history' },
        children: [
          {
            path: `${prefix}/history`,
            name: 'observe-alert-history',
            component: () => import('@/views/observe/alert/history'),
            meta: {
              requireAuth: true,
              title: '告警历史',
              upToAdmin: true,
              icon: 'mdi-history',
              show: true,
              rootName: 'observe',
              dependencies: ['monitoring'],
            },
          },
          {
            path: `${prefix}/blacklist`,
            name: 'observe-alert-blacklist',
            component: () => import('@/views/observe/alert/blacklist'),
            meta: {
              requireAuth: true,
              title: '告警黑名单',
              upToAdmin: true,
              icon: 'mdi-playlist-remove',
              show: true,
              rootName: 'observe',
              dependencies: ['monitoring'],
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
          required: ['tenant'],
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: 'observe-trace-search' },
        children: [
          {
            path: `${prefix}/search`,
            name: 'observe-trace-search',
            component: () => import('@/views/observe/trace'),
            meta: {
              requireAuth: true,
              title: '查询',
              upToAdmin: true,
              icon: 'mdi-feature-search-outline',
              show: true,
              rootName: 'observe',
              dependencies: ['jaeger'],
            },
          },
          {
            path: `${prefix}/detail`,
            name: 'observe-trace-detail',
            component: () => import('@/views/observe/trace/detail'),
            meta: {
              requireAuth: true,
              title: 'TraceId',
              upToAdmin: true,
              icon: 'mdi-details',
              show: true,
              rootName: 'observe',
              dependencies: ['jaeger'],
            },
          },
        ],
      },
    ],
  },
]
