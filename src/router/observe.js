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
              tip: 'observe',
            },
          },
        ],
      },

      /**
       * 接入中心
       */
      {
        path: 'integrated',
        meta: {
          header: '接入',
          title: '接入中心',
          icon: 'mdi-link-variant',
          show: true,
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: 'observe-integrated' },
        children: [
          {
            path: `${prefix}/components`,
            name: `observe-integrated`,
            component: () => import('@/views/observe/integrated'),
            meta: {
              requireAuth: true,
              title: '接入中心',
              upToAdmin: true,
              icon: 'mdi-widgets',
              show: true,
              rootName: 'observe',
              tip: 'integrated',
            },
          },
        ],
      },

      /**
       * 可视化
       */
      {
        path: 'dash',
        meta: {
          header: '可视化',
          title: '可视化',
          icon: 'mdi-view-dashboard',
          show: true,
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: 'observe-monitor-dashoard' },
        children: [
          {
            path: `${prefix}/dashoard`,
            name: `observe-monitor-dashoard`,
            component: () => import('@/views/observe/monitor/dashboard'),
            meta: {
              requireAuth: true,
              title: '监控大盘',
              upToAdmin: true,
              icon: 'mdi-gauge',
              show: true,
              rootName: 'observe',
              tip: 'dash-overview',
            },
          },
          {
            path: `${prefix}/metrics`,
            name: 'observe-monitor-metrics',
            component: () => import('@/views/observe/monitor/metrics'),
            meta: {
              requireAuth: true,
              title: '指标查询器',
              upToAdmin: true,
              icon: 'mdi-feature-search-outline',
              show: true,
              rootName: 'observe',
              tip: 'dash-metrics',
            },
          },
          {
            path: `${prefix}/viewer`,
            name: 'log-viewer',
            component: () => import('@/views/observe/log/viewer/index'),
            meta: {
              requireAuth: true,
              title: '日志查询器',
              upToAdmin: true,
              icon: 'mdi-format-list-bulleted',
              show: true,
              rootName: 'observe',
              dependencies: ['logging'],
              tip: 'dash-log',
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
              tip: 'dash-log-snapshot',
            },
          },
          {
            path: `${prefix}/search`,
            name: 'observe-trace-search',
            component: () => import('@/views/observe/trace'),
            meta: {
              requireAuth: true,
              title: '链路查询器',
              upToAdmin: true,
              icon: 'mdi-feature-search-outline',
              show: true,
              rootName: 'observe',
              dependencies: ['jaeger'],
              tip: 'dash-trace',
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
              tip: 'dash-trace',
            },
          },
        ],
      },

      /**
       * 告警中心
       */
      {
        path: 'alert',
        meta: {
          header: '告警',
          title: '告警中心',
          icon: 'mdi-alert',
          show: true,
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: 'observe-monitor-overview' },
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
              tip: 'alert-overview',
            },
          },
          {
            path: `${prefix}/living`,
            name: `observe-monitor-alert`,
            component: () => import('@/views/observe/monitor/alert'),
            meta: {
              requireAuth: true,
              title: '实时告警',
              upToAdmin: true,
              icon: 'mdi-alarm-multiple',
              show: true,
              rootName: 'observe',
              tip: 'alert-living',
            },
          },
          {
            path: `${prefix}/history`,
            name: 'observe-alert-history',
            component: () => import('@/views/observe/monitor/history'),
            meta: {
              requireAuth: true,
              title: '告警历史',
              upToAdmin: true,
              icon: 'mdi-history',
              show: true,
              rootName: 'observe',
              dependencies: ['monitoring'],
              tip: 'alert-history',
            },
          },
          {
            path: `${prefix}/blacklist`,
            name: 'observe-alert-blacklist',
            component: () => import('@/views/observe/monitor/blacklist'),
            meta: {
              requireAuth: true,
              title: '告警黑名单',
              upToAdmin: true,
              icon: 'mdi-playlist-remove',
              show: true,
              rootName: 'observe',
              dependencies: ['monitoring'],
              tip: 'alert-blacklist',
            },
          },
        ],
      },

      /**
       * 配置中心
       */
      {
        path: 'config',
        meta: {
          header: '配置',
          title: '配置中心',
          icon: 'mdi-wrench',
          show: true,
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: 'observe-monitor-config' },
        children: [
          {
            path: `${prefix}/monitor/config`,
            name: 'observe-monitor-config',
            component: () => import('@/views/observe/monitor/config'),
            meta: {
              requireAuth: true,
              title: '监控配置',
              upToAdmin: true,
              icon: 'mdi-format-list-bulleted',
              show: true,
              rootName: 'observe',
              tip: 'config-monitor',
            },
          },
          {
            path: `${prefix}/monitor/config/detail/service-monitor/:name`,
            name: 'servicemonitor-detail',
            component: () => import('@/views/observe/monitor/config/servicemonitor/detail'),
            meta: {
              requireAuth: true,
              title: '监控采集器',
              upToAdmin: true,
              icon: 'mdi-eyedropper',
              show: false,
              rootName: 'observe',
              tip: 'service-monitor',
            },
          },
          {
            path: `${prefix}/monitor/config/detail/prometheus-rule/:name`,
            name: 'prometheusrule-detail',
            component: () => import('@/views/observe/monitor/config/prometheusrule/detail'),
            meta: {
              requireAuth: true,
              title: '告警规则',
              upToAdmin: true,
              icon: 'mdi-ruler',
              show: false,
              rootName: 'observe',
              tip: 'prometheus-rule',
            },
          },
          {
            path: `${prefix}/log/config`,
            name: 'log-config',
            component: () => import('@/views/observe/log/config'),
            meta: {
              requireAuth: true,
              title: '日志配置',
              upToAdmin: true,
              icon: 'mdi-arrange-send-backward',
              show: true,
              rootName: 'observe',
              dependencies: ['logging'],
              tip: 'log-monitor',
            },
          },
          {
            path: `${prefix}/log/config/flow-detail/:kind/:name`,
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
              tip: 'flow',
            },
          },
          {
            path: `${prefix}/log/config/output-detail/:kind/:name`,
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
              tip: 'output',
            },
          },
          {
            path: `${prefix}/log/config/alert-detail/:name`,
            name: 'log-alert-detail',
            component: () => import('@/views/observe/log/config/alert_rule/detail'),
            meta: {
              requireAuth: true,
              title: '告警规则',
              upToAdmin: true,
              icon: 'mdi-ruler',
              show: false,
              rootName: 'observe',
              tip: 'prometheus-rule',
            },
          },
        ],
      },
    ],
  },
]
