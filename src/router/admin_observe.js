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
        redirect: { name: `${prefix}-observe-integrated` },
        children: [
          {
            path: `components`,
            name: `${prefix}-observe-integrated`,
            component: () => import('@/views/observe/integrated'),
            meta: {
              requireAuth: true,
              title: '接入中心',
              admin: true,
              icon: 'mdi-widgets',
              show: true,
              rootName: 'admin-observe',
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
        redirect: { name: `${prefix}-observe-monitor-dashboard` },
        children: [
          {
            path: `dashboard`,
            name: `${prefix}-observe-monitor-dashboard`,
            component: () => import('@/views/observe/monitor/dashboard'),
            meta: {
              requireAuth: true,
              title: '监控大盘',
              admin: true,
              icon: 'mdi-gauge',
              show: true,
              rootName: 'admin-observe',
            },
          },
          {
            path: `metrics`,
            name: `${prefix}-observe-monitor-metrics`,
            component: () => import('@/views/observe/monitor/metrics'),
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
            path: `viewer`,
            name: `${prefix}-log-viewer`,
            component: () => import('@/views/observe/log/viewer/index'),
            meta: {
              requireAuth: true,
              title: '日志查询器',
              admin: true,
              icon: 'mdi-format-list-bulleted',
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
              title: '日志快照',
              admin: true,
              icon: 'mdi-camera',
              show: true,
              rootName: 'admin-observe',
              dependencies: ['logging'],
            },
          },
          {
            path: `search`,
            name: `${prefix}-observe-trace-search`,
            component: () => import('@/views/observe/trace'),
            meta: {
              requireAuth: true,
              title: '链路查询器',
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
            path: `living`,
            name: `${prefix}-observe-monitor-alert`,
            component: () => import('@/views/observe/monitor/alert'),
            meta: {
              requireAuth: true,
              title: '实时告警',
              admin: true,
              icon: 'mdi-alarm-multiple',
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
        redirect: { name: `${prefix}-observe-monitor-config` },
        children: [
          {
            path: `monitor/config`,
            name: `${prefix}-observe-monitor-config`,
            component: () => import('@/views/observe/monitor/config'),
            meta: {
              requireAuth: true,
              title: '监控配置',
              admin: true,
              icon: 'mdi-format-list-bulleted',
              show: true,
              rootName: 'admin-observe',
            },
          },
          {
            path: `monitor/config/detail/servicemonitor/:name`,
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
            path: `monitor/config/detail/prometheus-rule/:name`,
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
            path: `log/config`,
            name: `${prefix}-log-config`,
            component: () => import('@/views/observe/log/config'),
            meta: {
              requireAuth: true,
              title: '日志配置',
              admin: true,
              icon: 'mdi-arrange-send-backward',
              show: true,
              rootName: 'admin-observe',
              dependencies: ['logging'],
            },
          },

          {
            path: `log/config/flow-detail/:kind/:name`,
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
            path: `log/config/output-detail/:kind/:name`,
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
          {
            path: `channel`,
            name: `${prefix}-observe-monitor-channel`,
            component: () => import('@/views/observe/monitor/channel'),
            meta: {
              requireAuth: true,
              title: '告警渠道',
              admin: true,
              icon: 'mdi-road-variant',
              show: true,
              rootName: 'admin-observe',
            },
          },
        ],
      },
    ],
  },
]
