import { RouteConfig } from 'vue-router';

const prefix = ':tenant?';

export const observe: RouteConfig[] = [
  {
    path: '/observe',
    name: 'observe',
    component: (): Promise<typeof import('*.vue')> => import('@/layouts/Layout.vue'),
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
        component: (): Promise<typeof import('*.vue')> => import('@/layouts/Container.vue'),
        children: [
          {
            path: `${prefix}/overview`,
            name: 'observe-overview',
            component: (): Promise<typeof import('*.vue')> => import('@/views/observe/overview/index.vue'),
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
        component: (): Promise<typeof import('*.vue')> => import('@/layouts/Container.vue'),
        redirect: { name: 'observe-integrated' },
        children: [
          {
            path: `${prefix}/components`,
            name: `observe-integrated`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/observe/integrated/index.vue'),
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
        component: (): Promise<typeof import('*.vue')> => import('@/layouts/Container.vue'),
        redirect: { name: 'observe-monitor-dashoard' },
        children: [
          {
            path: `${prefix}/dashoard`,
            name: `observe-monitor-dashoard`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/observe/monitor/dashboard/index.vue'),
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
          {
            path: `${prefix}/appmonitor`,
            name: `observe-monitor-app`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/observe/monitor/app/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.observability.monitor_app',
              upToAdmin: true,
              icon: 'mdi-chart-line-stacked',
              show: true,
              rootName: 'observe',
              dependencies: ['tracing'],
              tip: 'dash_app',
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
        component: (): Promise<typeof import('*.vue')> => import('@/layouts/Container.vue'),
        redirect: { name: 'observe-monitor-metrics' },
        children: [
          {
            path: `${prefix}/metrics`,
            name: 'observe-monitor-metrics',
            component: (): Promise<typeof import('*.vue')> => import('@/views/observe/monitor/metrics/index.vue'),
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
            component: (): Promise<typeof import('*.vue')> => import('@/views/observe/log/viewer/index.vue'),
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
            component: (): Promise<typeof import('*.vue')> => import('@/views/observe/trace/index.vue'),
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
        component: (): Promise<typeof import('*.vue')> => import('@/layouts/Container.vue'),
        redirect: { name: 'observe-monitor-overview' },
        children: [
          {
            path: `${prefix}/overview`,
            name: 'observe-monitor-overview',
            component: (): Promise<typeof import('*.vue')> => import('@/views/observe/alert/dashboard/index.vue'),
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
            component: (): Promise<typeof import('*.vue')> => import('@/views/observe/alert/history/index.vue'),
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
            component: (): Promise<typeof import('*.vue')> => import('@/views/observe/alert/blacklist/index.vue'),
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
        component: (): Promise<typeof import('*.vue')> => import('@/layouts/Container.vue'),
        redirect: { name: 'observe-monitor-config' },
        children: [
          {
            path: `${prefix}/monitor/config`,
            name: 'observe-monitor-config',
            component: (): Promise<typeof import('*.vue')> => import('@/views/observe/monitor/config/index.vue'),
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
            component: (): Promise<typeof import('*.vue')> =>
              import('@/views/observe/monitor/config/servicemonitor/detail.vue'),
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
            component: (): Promise<typeof import('*.vue')> =>
              import('@/views/observe/monitor/config/prometheusrule/detail.vue'),
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
            component: (): Promise<typeof import('*.vue')> => import('@/views/observe/log/config/index.vue'),
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
            component: (): Promise<typeof import('*.vue')> => import('@/views/observe/log/config/flow/detail.vue'),
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
            component: (): Promise<typeof import('*.vue')> => import('@/views/observe/log/config/output/detail.vue'),
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
            component: (): Promise<typeof import('*.vue')> =>
              import('@/views/observe/log/config/alert_rule/detail.vue'),
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
          {
            path: `${prefix}/channel`,
            name: 'observe-channel',
            component: (): Promise<typeof import('*.vue')> => import('@/views/observe/channel/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.observability.channel',
              upToAdmin: true,
              icon: 'mdi-axis-arrow',
              show: true,
              rootName: 'observe',
              tip: 'alert_channel',
              innerCheck: true,
            },
          },
        ],
      },
    ],
  },
];
