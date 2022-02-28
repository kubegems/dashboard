const prefix = ':tenant'

export const observe = [
  {
    path: '/observe',
    name: 'observe',
    component: () => import('@/layouts/Layout'),
    redirect: { name: 'log-viewer' },
    children: [
      {
        path: 'log',
        meta: {
          header: '日志',
          title: '日志',
          icon: 'mdi-math-log',
          dependencies: ['logging', 'loki'],
          required: ['tenant'],
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: 'log-viewer' },
        children: [
          // viewer
          {
            path: `${prefix}/viewer`,
            name: 'log-viewer',
            component: () => import('@/views/observe/log/viewer/viewer'),
            meta: {
              requireAuth: true,
              title: '日志查看器',
              upToAdmin: true,
              icon: 'mdi-format-list-bulleted',
              show: true,
              rootName: 'observe',
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
            },
          },
          {
            path: `${prefix}/flow`,
            name: `log-flow`,
            component: () => import('@/views/observe/log/operator/flow'),
            meta: {
              requireAuth: true,
              title: '日志采集器',
              upToAdmin: true,
              icon: 'mdi-arrange-send-backward',
              show: true,
              rootName: 'observe',
            },
          },
          {
            path: `${prefix}/flow/:name`,
            name: `log-flow-detail`,
            component: () => import('@/views/observe/log/operator/flow/detail'),
            meta: {
              requireAuth: true,
              title: '日志采集器详情',
              upToAdmin: true,
              icon: 'mdi-arrange-send-backward',
              show: false,
              rootName: 'observe',
            },
          },
          {
            path: `${prefix}/output`,
            name: `log-output`,
            component: () => import('@/views/observe/log/operator/output'),
            meta: {
              requireAuth: true,
              title: '日志路由器',
              upToAdmin: true,
              icon: 'mdi-router-wireless',
              show: true,
              rootName: 'observe',
            },
          },
          {
            path: `${prefix}/output/:name`,
            name: `log-output-detail`,
            component: () => import('@/views/observe/log/operator/output/detail'),
            meta: {
              requireAuth: true,
              title: '日志路由器详情',
              upToAdmin: true,
              icon: 'mdi-router-wireless',
              show: false,
              rootName: 'observe',
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
              icon: 'mdi-history',
              show: true,
              rootName: 'observe',
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
            },
          },
        ],
      },
    ],
  },
]
