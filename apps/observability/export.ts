/*
 * Copyright 2022 The kubegems.io Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { RouteConfig } from 'vue-router';

const adminPrefix = 'admin';

export const adminObserve: RouteConfig[] = [
  // overview
  {
    path: '',
    meta: {
      header: 'routerbar.observability.h_dashboard',
      title: 'routerbar.observability.g_dashboard',
      icon: 'mdi-tablet-dashboard',
      show: true,
    },
    redirect: { name: `${adminPrefix}-observe-overview` },
    component: () => import('@kubegems/components/layouts/Container.vue'),
    children: [
      {
        path: `overview`,
        name: `${adminPrefix}-observe-overview`,
        component: () => import('./src/views/observe/overview/index.vue'),
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
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: `${adminPrefix}-observe-integrated` },
    children: [
      {
        path: `components`,
        name: `${adminPrefix}-observe-integrated`,
        component: () => import('./src/views/observe/integrated/index.vue'),
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
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: `${adminPrefix}-observe-monitor-dashboard` },
    children: [
      {
        path: `dashboard`,
        name: `${adminPrefix}-observe-monitor-dashboard`,
        component: () => import('./src/views/observe/monitor/dashboard/index.vue'),
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
      {
        path: `appmonitor`,
        name: `${adminPrefix}-observe-monitor-app`,
        component: () => import('./src/views/observe/monitor/app/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.observability.monitor_app',
          admin: true,
          icon: 'mdi-chart-line-stacked',
          show: true,
          rootName: 'admin-observe',
          dependencies: ['tracing'],
          tip: 'dash_app',
          innerCheck: true,
        },
      },
      {
        path: `probe`,
        name: `${adminPrefix}-observe-monitor-probe`,
        component: () => import('./src/views/observe/monitor/probe/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.observability.monitor_probe',
          admin: true,
          icon: 'mdi-broadcast',
          show: true,
          rootName: 'admin-observe',
          dependencies: ['monitoring'],
          tip: 'dash_probe',
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
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: `${adminPrefix}-observe-monitor-metrics` },
    children: [
      {
        path: `metrics`,
        name: `${adminPrefix}-observe-monitor-metrics`,
        component: () => import('./src/views/observe/monitor/metrics/index.vue'),
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
        name: `${adminPrefix}-log-viewer`,
        component: () => import('./src/views/observe/log/viewer/index.vue'),
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
        name: `${adminPrefix}-observe-trace-search`,
        component: () => import('./src/views/observe/trace/index.vue'),
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
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: `${adminPrefix}-observe-monitor-overview` },
    children: [
      {
        path: `overview`,
        name: `${adminPrefix}-observe-monitor-overview`,
        component: () => import('./src/views/observe/alert/dashboard/index.vue'),
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
        name: `${adminPrefix}-observe-alert-history`,
        component: () => import('./src/views/observe/alert/history/index.vue'),
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
        name: `${adminPrefix}-observe-alert-blacklist`,
        component: () => import('./src/views/observe/alert/blacklist/index.vue'),
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
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: `${adminPrefix}-observe-monitor-config` },
    children: [
      {
        path: `monitor/config`,
        name: `${adminPrefix}-observe-monitor-config`,
        component: () => import('./src/views/observe/monitor/config/index.vue'),
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
        name: `${adminPrefix}-servicemonitor-detail`,
        component: () => import('./src/views/observe/monitor/config/servicemonitor/detail.vue'),
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
        name: `${adminPrefix}-prometheusrule-detail`,
        component: () => import('./src/views/observe/monitor/config/prometheusrule/detail.vue'),
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
        name: `${adminPrefix}-log-config`,
        component: () => import('./src/views/observe/log/config/index.vue'),
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
        name: `${adminPrefix}-log-flow-detail`,
        component: () => import('./src/views/observe/log/config/flow/detail.vue'),
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
        name: `${adminPrefix}-log-output-detail`,
        component: () => import('./src/views/observe/log/config/output/detail.vue'),
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
        name: `${adminPrefix}-log-alert-detail`,
        component: () => import('./src/views/observe/log/config/alert_rule/detail.vue'),
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
      {
        path: `channel`,
        name: `${adminPrefix}-observe-channel`,
        component: () => import('./src/views/observe/channel/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.observability.channel',
          admin: true,
          icon: 'mdi-axis-arrow',
          show: true,
          rootName: 'admin-observe',
          tip: 'alert_channel',
          innerCheck: true,
        },
      },
    ],
  },
];

const prefix = ':tenant?';

export const observe: RouteConfig[] = [
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
    component: () => import('@kubegems/components/layouts/Container.vue'),
    children: [
      {
        path: `${prefix}/overview`,
        name: 'observe-overview',
        component: () => import('./src/views/observe/overview/index.vue'),
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
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: 'observe-integrated' },
    children: [
      {
        path: `${prefix}/components`,
        name: `observe-integrated`,
        component: () => import('./src/views/observe/integrated/index.vue'),
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
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: 'observe-monitor-dashoard' },
    children: [
      {
        path: `${prefix}/dashoard`,
        name: `observe-monitor-dashoard`,
        component: () => import('./src/views/observe/monitor/dashboard/index.vue'),
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
        component: () => import('./src/views/observe/monitor/app/index.vue'),
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
      {
        path: `${prefix}/probe`,
        name: `observe-monitor-probe`,
        component: () => import('./src/views/observe/monitor/probe/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.observability.monitor_probe',
          upToAdmin: true,
          icon: 'mdi-broadcast',
          show: true,
          rootName: 'observe',
          dependencies: ['monitoring'],
          tip: 'dash_probe',
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
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: 'observe-monitor-metrics' },
    children: [
      {
        path: `${prefix}/metrics`,
        name: 'observe-monitor-metrics',
        component: () => import('./src/views/observe/monitor/metrics/index.vue'),
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
        component: () => import('./src/views/observe/log/viewer/index.vue'),
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
        component: () => import('./src/views/observe/trace/index.vue'),
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
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: 'observe-monitor-overview' },
    children: [
      {
        path: `${prefix}/overview`,
        name: 'observe-monitor-overview',
        component: () => import('./src/views/observe/alert/dashboard/index.vue'),
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
        component: () => import('./src/views/observe/alert/history/index.vue'),
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
        component: () => import('./src/views/observe/alert/blacklist/index.vue'),
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
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: 'observe-monitor-config' },
    children: [
      {
        path: `${prefix}/monitor/config`,
        name: 'observe-monitor-config',
        component: () => import('./src/views/observe/monitor/config/index.vue'),
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
        component: () => import('./src/views/observe/monitor/config/servicemonitor/detail.vue'),
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
        component: () => import('./src/views/observe/monitor/config/prometheusrule/detail.vue'),
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
        component: () => import('./src/views/observe/log/config/index.vue'),
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
        component: () => import('./src/views/observe/log/config/flow/detail.vue'),
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
        component: () => import('./src/views/observe/log/config/output/detail.vue'),
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
        component: () => import('./src/views/observe/log/config/alert_rule/detail.vue'),
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
        component: () => import('./src/views/observe/channel/index.vue'),
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
];
