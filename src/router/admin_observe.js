const prefix = 'admin';

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
          header: 'routerbar.observability.h_dashboard',
          title: 'routerbar.observability.g_dashboard',
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
              title: 'routerbar.observability.dashboard',
              admin: true,
              icon: 'mdi-home',
              show: true,
              rootName: 'admin-observe',
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
          header: 'routerbar.observability.h_integrated',
          title: 'routerbar.observability.g_integrated',
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
              title: 'routerbar.observability.integrated',
              admin: true,
              icon: 'mdi-widgets',
              show: true,
              rootName: 'admin-observe',
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
          header: 'routerbar.observability.h_observability',
          title: 'routerbar.observability.g_observability',
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
              title: 'routerbar.observability.monitor_dahboard',
              admin: true,
              icon: 'mdi-gauge',
              show: true,
              rootName: 'admin-observe',
              dependencies: ['monitoring'],
              tip: 'dash_overview',
              innerCheck: true,
            },
          },
        ],
      },
      {
        path: 'query',
        meta: {
          title: 'routerbar.observability.g_inquirer',
          icon: 'mdi-magnify',
          show: true,
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: `${prefix}-observe-monitor-metrics` },
        children: [
          {
            path: `metrics`,
            name: `${prefix}-observe-monitor-metrics`,
            component: () => import('@/views/observe/monitor/metrics'),
            meta: {
              requireAuth: true,
              title: 'routerbar.observability.metrics_inquirer',
              admin: true,
              icon: 'mdi-feature-search-outline',
              show: true,
              rootName: 'admin-observe',
              tip: 'dash_metrics',
              dependencies: ['monitoring'],
              innerCheck: true,
            },
          },
          {
            path: `viewer`,
            name: `${prefix}-log-viewer`,
            component: () => import('@/views/observe/log/viewer/index'),
            meta: {
              requireAuth: true,
              title: 'routerbar.observability.log_inquirer',
              admin: true,
              icon: 'mdi-format-list-bulleted',
              show: true,
              rootName: 'admin-observe',
              dependencies: ['logging'],
              tip: 'dash_log',
              innerCheck: true,
            },
          },
          {
            path: `search`,
            name: `${prefix}-observe-trace-search`,
            component: () => import('@/views/observe/trace'),
            meta: {
              requireAuth: true,
              title: 'routerbar.observability.trace_inquirer',
              admin: true,
              icon: 'mdi-glasses',
              show: true,
              rootName: 'admin-observe',
              dependencies: ['tracing'],
              tip: 'dash_trace',
              innerCheck: true,
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
          header: 'routerbar.observability.h_alert',
          title: 'routerbar.observability.g_alert',
          icon: 'mdi-alert',
          show: true,
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: `${prefix}-observe-monitor-overview` },
        children: [
          {
            path: `overview`,
            name: `${prefix}-observe-monitor-overview`,
            component: () => import('@/views/observe/alert/dashboard'),
            meta: {
              requireAuth: true,
              title: 'routerbar.observability.alert_dashboard',
              admin: true,
              icon: 'mdi-monitor-dashboard',
              show: true,
              rootName: 'admin-observe',
              dependencies: ['monitoring'],
              tip: 'alert_overview',
              innerCheck: true,
            },
          },
          {
            path: `history`,
            name: `${prefix}-observe-alert-history`,
            component: () => import('@/views/observe/alert/history'),
            meta: {
              requireAuth: true,
              title: 'routerbar.observability.alert_history',
              admin: true,
              icon: 'mdi-history',
              show: true,
              rootName: 'admin-observe',
              dependencies: ['monitoring'],
              tip: 'alert_history',
              innerCheck: true,
            },
          },
          {
            path: `blacklist`,
            name: `${prefix}-observe-alert-blacklist`,
            component: () => import('@/views/observe/alert/blacklist'),
            meta: {
              requireAuth: true,
              title: 'routerbar.observability.alert_blacklist',
              admin: true,
              icon: 'mdi-playlist-remove',
              show: true,
              rootName: 'admin-observe',
              dependencies: ['monitoring'],
              tip: 'alert_blacklist',
              innerCheck: true,
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
          header: 'routerbar.observability.h_setting',
          title: 'routerbar.observability.g_setting',
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
              title: 'routerbar.observability.mertic_setting',
              admin: true,
              icon: 'mdi-format-list-bulleted',
              show: true,
              rootName: 'admin-observe',
              dependencies: ['monitoring'],
              tip: 'config_monitor',
              innerCheck: true,
            },
          },
          {
            path: `monitor/config/detail/servicemonitor/:name`,
            name: `${prefix}-servicemonitor-detail`,
            component: () => import('@/views/observe/monitor/config/servicemonitor/detail'),
            meta: {
              requireAuth: true,
              title: 'routerbar.observability.servicemonitor',
              admin: true,
              icon: 'mdi-eyedropper',
              show: false,
              rootName: 'admin-observe',
              dependencies: ['monitoring'],
              tip: 'service_monitor',
              innerCheck: true,
            },
          },
          {
            path: `monitor/config/detail/prometheus-rule/:name`,
            name: `${prefix}-prometheusrule-detail`,
            component: () => import('@/views/observe/monitor/config/prometheusrule/detail'),
            meta: {
              requireAuth: true,
              title: 'routerbar.observability.prometheusrule',
              admin: true,
              icon: 'mdi-ruler',
              show: false,
              rootName: 'admin-observe',
              dependencies: ['monitoring'],
              tip: 'prometheus_rule',
              innerCheck: true,
            },
          },
          {
            path: `log/config`,
            name: `${prefix}-log-config`,
            component: () => import('@/views/observe/log/config'),
            meta: {
              requireAuth: true,
              title: 'routerbar.observability.log_setting',
              admin: true,
              icon: 'mdi-arrange-send-backward',
              show: true,
              rootName: 'admin-observe',
              dependencies: ['logging'],
              tip: 'log_monitor',
              innerCheck: true,
            },
          },

          {
            path: `log/config/flow-detail/:kind/:name`,
            name: `${prefix}-log-flow-detail`,
            component: () => import('@/views/observe/log/config/flow/detail'),
            meta: {
              requireAuth: true,
              title: 'routerbar.observability.flow',
              admin: true,
              icon: 'mdi-arrange-send-backward',
              show: false,
              rootName: 'admin-observe',
              dependencies: ['logging'],
              tip: 'flow',
              innerCheck: true,
            },
          },
          {
            path: `log/config/output-detail/:kind/:name`,
            name: `${prefix}-log-output-detail`,
            component: () => import('@/views/observe/log/config/output/detail'),
            meta: {
              requireAuth: true,
              title: 'routerbar.observability.output',
              admin: true,
              icon: 'mdi-router-wireless',
              show: false,
              rootName: 'admin-observe',
              dependencies: ['logging'],
              tip: 'output',
              innerCheck: true,
            },
          },
          {
            path: `log/config/alert-detail/:name`,
            name: `${prefix}-log-alert-detail`,
            component: () => import('@/views/observe/log/config/alert_rule/detail'),
            meta: {
              requireAuth: true,
              title: 'routerbar.observability.alertrule',
              admin: true,
              icon: 'mdi-ruler',
              show: false,
              rootName: 'admin-observe',
              dependencies: ['monitoring'],
              tip: 'prometheus_rule',
              innerCheck: true,
            },
          },
        ],
      },
    ],
  },
];
