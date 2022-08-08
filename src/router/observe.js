const prefix = ':tenant?';

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
          header: 'routerbar.observability.h_dashboard',
          title: 'routerbar.observability.g_dashboard',
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
              title: 'routerbar.observability.dashboard',
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
          header: 'routerbar.observability.h_integrated',
          title: 'routerbar.observability.g_integrated',
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
              title: 'routerbar.observability.integrated',
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
          header: 'routerbar.observability.h_observability',
          title: 'routerbar.observability.g_observability',
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
              title: 'routerbar.observability.monitor_dahboard',
              upToAdmin: true,
              icon: 'mdi-gauge',
              show: true,
              rootName: 'observe',
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
        redirect: { name: 'observe-monitor-metrics' },
        children: [
          {
            path: `${prefix}/metrics`,
            name: 'observe-monitor-metrics',
            component: () => import('@/views/observe/monitor/metrics'),
            meta: {
              requireAuth: true,
              title: 'routerbar.observability.metrics_inquirer',
              upToAdmin: true,
              icon: 'mdi-feature-search-outline',
              show: true,
              rootName: 'observe',
              dependencies: ['monitoring'],
              tip: 'dash_metrics',
              innerCheck: true,
            },
          },
          {
            path: `${prefix}/viewer`,
            name: 'log-viewer',
            component: () => import('@/views/observe/log/viewer/index'),
            meta: {
              requireAuth: true,
              title: 'routerbar.observability.log_inquirer',
              upToAdmin: true,
              icon: 'mdi-format-list-bulleted',
              show: true,
              rootName: 'observe',
              dependencies: ['logging'],
              tip: 'dash_log',
              innerCheck: true,
            },
          },
          {
            path: `${prefix}/search`,
            name: 'observe-trace-search',
            component: () => import('@/views/observe/trace'),
            meta: {
              requireAuth: true,
              title: 'routerbar.observability.trace_inquirer',
              upToAdmin: true,
              icon: 'mdi-glasses',
              show: true,
              rootName: 'observe',
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
        redirect: { name: 'observe-monitor-overview' },
        children: [
          {
            path: `${prefix}/overview`,
            name: 'observe-monitor-overview',
            component: () => import('@/views/observe/alert/dashboard'),
            meta: {
              requireAuth: true,
              title: 'routerbar.observability.alert_dashboard',
              upToAdmin: true,
              icon: 'mdi-monitor-dashboard',
              show: true,
              rootName: 'observe',
              dependencies: ['monitoring'],
              tip: 'alert_overview',
              innerCheck: true,
            },
          },
          {
            path: `${prefix}/history`,
            name: 'observe-alert-history',
            component: () => import('@/views/observe/alert/history'),
            meta: {
              requireAuth: true,
              title: 'routerbar.observability.alert_history',
              upToAdmin: true,
              icon: 'mdi-history',
              show: true,
              rootName: 'observe',
              dependencies: ['monitoring'],
              tip: 'alert_history',
              innerCheck: true,
            },
          },
          {
            path: `${prefix}/blacklist`,
            name: 'observe-alert-blacklist',
            component: () => import('@/views/observe/alert/blacklist'),
            meta: {
              requireAuth: true,
              title: 'routerbar.observability.alert_blacklist',
              upToAdmin: true,
              icon: 'mdi-playlist-remove',
              show: true,
              rootName: 'observe',
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
        redirect: { name: 'observe-monitor-config' },
        children: [
          {
            path: `${prefix}/monitor/config`,
            name: 'observe-monitor-config',
            component: () => import('@/views/observe/monitor/config'),
            meta: {
              requireAuth: true,
              title: 'routerbar.observability.mertic_setting',
              upToAdmin: true,
              icon: 'mdi-format-list-bulleted',
              show: true,
              rootName: 'observe',
              dependencies: ['monitoring'],
              tip: 'config_monitor',
              innerCheck: true,
            },
          },
          {
            path: `${prefix}/monitor/config/detail/service-monitor/:name`,
            name: 'servicemonitor-detail',
            component: () => import('@/views/observe/monitor/config/servicemonitor/detail'),
            meta: {
              requireAuth: true,
              title: 'routerbar.observability.servicemonitor',
              upToAdmin: true,
              icon: 'mdi-eyedropper',
              show: false,
              rootName: 'observe',
              dependencies: ['monitoring'],
              tip: 'service_monitor',
              innerCheck: true,
            },
          },
          {
            path: `${prefix}/monitor/config/detail/prometheus-rule/:name`,
            name: 'prometheusrule-detail',
            component: () => import('@/views/observe/monitor/config/prometheusrule/detail'),
            meta: {
              requireAuth: true,
              title: 'routerbar.observability.prometheusrule',
              upToAdmin: true,
              icon: 'mdi-ruler',
              show: false,
              rootName: 'observe',
              dependencies: ['monitoring'],
              tip: 'prometheus_rule',
              innerCheck: true,
            },
          },
          {
            path: `${prefix}/log/config`,
            name: 'log-config',
            component: () => import('@/views/observe/log/config'),
            meta: {
              requireAuth: true,
              title: 'routerbar.observability.log_setting',
              upToAdmin: true,
              icon: 'mdi-arrange-send-backward',
              show: true,
              rootName: 'observe',
              dependencies: ['logging'],
              tip: 'log_monitor',
              innerCheck: true,
            },
          },
          {
            path: `${prefix}/log/config/flow-detail/:kind/:name`,
            name: 'log-flow-detail',
            component: () => import('@/views/observe/log/config/flow/detail'),
            meta: {
              requireAuth: true,
              title: 'routerbar.observability.flow',
              upToAdmin: true,
              icon: 'mdi-arrange-send-backward',
              show: false,
              rootName: 'observe',
              dependencies: ['logging'],
              tip: 'flow',
              innerCheck: true,
            },
          },
          {
            path: `${prefix}/log/config/output-detail/:kind/:name`,
            name: 'log-output-detail',
            component: () => import('@/views/observe/log/config/output/detail'),
            meta: {
              requireAuth: true,
              title: 'routerbar.observability.output',
              upToAdmin: true,
              icon: 'mdi-router-wireless',
              show: false,
              rootName: 'observe',
              dependencies: ['logging'],
              tip: 'output',
              innerCheck: true,
            },
          },
          {
            path: `${prefix}/log/config/alert-detail/:name`,
            name: 'log-alert-detail',
            component: () => import('@/views/observe/log/config/alert_rule/detail'),
            meta: {
              requireAuth: true,
              title: 'routerbar.observability.alertrule',
              upToAdmin: true,
              icon: 'mdi-ruler',
              show: false,
              rootName: 'observe',
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
