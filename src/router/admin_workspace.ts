import { RouteConfig } from 'vue-router';

const prefix = 'clusters/:cluster?';
const namePrefix = 'admin';

export const adminWorkspace: RouteConfig[] = [
  {
    path: '/',
    name: 'admin-workspace',
    component: (): Promise<typeof import('*.vue')> => import('@/layouts/Layout.vue'),
    redirect: { name: 'cluster-center' },
    children: [
      {
        path: '',
        meta: {
          header: 'routerbar.cluster.h_cluster',
          title: 'routerbar.cluster.g_cluster',
          icon: 'mdi-server-network',
          required: ['cluster'],
        },
        component: (): Promise<typeof import('*.vue')> => import('@/layouts/Container.vue'),
        redirect: { name: 'cluster-center' },
        children: [
          // cluster
          {
            path: `${prefix}/clusters`,
            name: `cluster-center`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/resource/cluster/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.cluster_dashboard',
              admin: true,
              icon: 'mdi-server',
              show: true,
              rootName: 'admin-workspace',
              tip: 'cluster',
            },
          },
          {
            path: `${prefix}/clusters/:name`,
            name: `cluster-detail`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/resource/cluster/detail.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.cluster_dashboard',
              admin: true,
              icon: 'mdi-server',
              show: false,
              rootName: 'admin-workspace',
              tip: 'cluster',
            },
          },
          // plugin
          {
            path: `${prefix}/plugins`,
            name: `plugin-center`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/resource/plugin/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.plugins',
              admin: true,
              icon: 'mdi-power-plug',
              show: true,
              rootName: 'admin-workspace',
              tip: 'plugin',
            },
          },
        ],
      },
      {
        path: '',
        meta: {
          header: 'routerbar.cluster.h_node',
          title: 'routerbar.cluster.g_node',
          icon: 'mdi-desktop-tower',
          required: ['cluster'],
        },
        component: (): Promise<typeof import('*.vue')> => import('@/layouts/Container.vue'),
        redirect: { name: 'node-list' },
        children: [
          // node
          {
            path: `${prefix}/nodes`,
            name: `node-list`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/resource/node/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.node',
              admin: true,
              icon: 'mdi-lan-connect',
              show: true,
              rootName: 'admin-workspace',
              tip: 'node',
            },
          },
          {
            path: `${prefix}/nodes/:name`,
            name: `node-detail`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/resource/node/detail.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.node',
              admin: true,
              icon: 'mdi-lan-connect',
              show: false,
              rootName: 'admin-workspace',
              tip: 'node',
            },
          },
        ],
      },
      {
        path: '',
        meta: {
          header: 'routerbar.cluster.h_container',
          title: 'routerbar.cluster.g_runtime',
          icon: 'mdi-application',
          required: ['cluster'],
        },
        component: (): Promise<typeof import('*.vue')> => import('@/layouts/Container.vue'),
        redirect: { name: `${namePrefix}-workload-list` },
        children: [
          // workload
          {
            path: `${prefix}/workloads`,
            name: `${namePrefix}-workload-list`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/resource/workload/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.workload',
              admin: true,
              icon: 'mdi-vector-arrange-above',
              show: true,
              rootName: 'admin-workspace',
              tip: 'workload',
            },
          },
          {
            path: `${prefix}/workloads/:name`,
            name: `${namePrefix}-workload-detail`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/resource/workload/detail.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.workload',
              admin: true,
              icon: 'mdi-vector-arrange-above',
              show: false,
              rootName: 'admin-workspace',
              tip: 'workload',
            },
          },
          // pod
          {
            path: `${prefix}/pods`,
            name: `${namePrefix}-pod-list`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/resource/pod/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.pod',
              admin: true,
              icon: 'mdi-microsoft',
              show: true,
              rootName: 'admin-workspace',
              tip: 'pod',
            },
          },
          {
            path: `${prefix}/pods/:name`,
            name: `${namePrefix}-pod-detail`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/resource/pod/detail.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.pod',
              admin: true,
              icon: 'mdi-microsoft',
              show: false,
              rootName: 'admin-workspace',
              tip: 'pod',
            },
          },
          // service
          {
            path: `${prefix}/services`,
            name: `${namePrefix}-service-list`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/resource/service/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.service',
              admin: true,
              icon: 'mdi-dns',
              show: true,
              rootName: 'admin-workspace',
              tip: 'service',
            },
          },
          {
            path: `${prefix}/services/:name`,
            name: `${namePrefix}-service-detail`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/resource/service/detail.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.service',
              admin: true,
              icon: 'mdi-dns',
              show: false,
              rootName: 'admin-workspace',
              tip: 'service',
            },
          },
          // ingress
          {
            path: `${prefix}/ingress`,
            name: `${namePrefix}-ingress-list`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/resource/ingress/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.ingress',
              admin: true,
              icon: 'mdi-network',
              show: true,
              rootName: 'admin-workspace',
              tip: 'ingress',
            },
          },
          {
            path: `${prefix}/ingress/:name`,
            name: `${namePrefix}-ingress-detail`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/resource/ingress/detail.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.ingress',
              admin: true,
              icon: 'mdi-network',
              show: false,
              rootName: 'admin-workspace',
              tip: 'ingress',
            },
          },
          // gateway
          {
            path: `${prefix}/gateways`,
            name: `${namePrefix}-gateway-center`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/resource/gateway/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.gateway',
              admin: true,
              icon: 'mdi-gate',
              show: true,
              rootName: 'admin-workspace',
              tip: 'gateway',
            },
          },
          {
            path: `${prefix}/gateways/:name`,
            name: `${namePrefix}-gateway-detail`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/resource/gateway/detail.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.gateway',
              admin: true,
              icon: 'mdi-gate',
              show: false,
              rootName: 'admin-workspace',
              tip: 'gateway',
            },
          },
        ],
      },
      {
        path: '',
        meta: {
          title: 'routerbar.cluster.g_task',
          icon: 'mdi-playlist-check',
          required: ['cluster'],
        },
        component: (): Promise<typeof import('*.vue')> => import('@/layouts/Container.vue'),
        redirect: { name: `${namePrefix}-job-list` },
        children: [
          // job
          {
            path: `${prefix}/jobs`,
            name: `${namePrefix}-job-list`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/resource/job/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.job',
              admin: true,
              icon: 'mdi-repeat-once',
              show: true,
              rootName: 'admin-workspace',
              tip: 'job',
            },
          },
          {
            path: `${prefix}/jobs/:name`,
            name: `${namePrefix}-job-detail`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/resource/job/detail.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.job',
              admin: true,
              icon: 'mdi-repeat-once',
              show: false,
              rootName: 'admin-workspace',
              tip: 'job',
            },
          },
          // cronjob
          {
            path: `${prefix}/cronjobs`,
            name: `${namePrefix}-cronjob-list`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/resource/cronjob/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.cronjob',
              admin: true,
              icon: 'mdi-calendar-clock',
              show: true,
              rootName: 'admin-workspace',
              tip: 'cronjob',
            },
          },
          {
            path: `${prefix}/cronjobs/:name`,
            name: `${namePrefix}-cronjob-detail`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/resource/cronjob/detail.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.cronjob',
              admin: true,
              icon: 'mdi-calendar-clock',
              show: false,
              rootName: 'admin-workspace',
              tip: 'cronjob',
            },
          },
        ],
      },
      {
        path: '',
        meta: {
          title: 'routerbar.cluster.g_config',
          icon: 'mdi-brightness-7',
          required: ['cluster'],
        },
        component: (): Promise<typeof import('*.vue')> => import('@/layouts/Container.vue'),
        redirect: { name: `${namePrefix}-configmap-list` },
        children: [
          // configmap
          {
            path: `${prefix}/configmaps`,
            name: `${namePrefix}-configmap-list`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/resource/configmap/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.configmap',
              admin: true,
              icon: 'mdi-wrench',
              show: true,
              rootName: 'admin-workspace',
              tip: 'configmap',
            },
          },
          {
            path: `${prefix}/configmaps/:name`,
            name: `${namePrefix}-configmap-detail`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/resource/configmap/detail.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.configmap',
              admin: true,
              icon: 'mdi-wrench',
              show: false,
              rootName: 'admin-workspace',
              tip: 'configmap',
            },
          },
          // secret
          {
            path: `${prefix}/secrets`,
            name: `${namePrefix}-secret-list`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/resource/secret/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.secret',
              admin: true,
              icon: 'mdi-key-variant',
              show: true,
              rootName: 'admin-workspace',
              tip: 'secret',
            },
          },
          {
            path: `${prefix}/secrets/:name`,
            name: `${namePrefix}-secret-detail`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/resource/secret/detail.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.secret',
              admin: true,
              icon: 'mdi-key-variant',
              show: false,
              rootName: 'admin-workspace',
              tip: 'secret',
            },
          },
          // certmanager
          {
            path: `${prefix}/certmanager`,
            name: `${namePrefix}-certmanager`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/resource/certmanager/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.certmanager',
              admin: true,
              icon: 'mdi-book-open',
              show: true,
              rootName: 'admin-workspace',
              tip: 'certmanager',
              dependencies: ['cert-manager'],
            },
          },
          {
            path: `${prefix}/certmanager/:name`,
            name: `${namePrefix}-certificate-detail`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/resource/certmanager/detail.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.certmanager',
              admin: true,
              icon: 'mdi-book-open',
              show: false,
              rootName: 'admin-workspace',
              tip: 'certmanager',
              dependencies: ['cert-manager'],
            },
          },
        ],
      },
      {
        path: '',
        meta: {
          title: 'routerbar.cluster.g_crd',
          icon: 'mdi-arrow-down-box',
          required: ['cluster'],
        },
        component: (): Promise<typeof import('*.vue')> => import('@/layouts/Container.vue'),
        redirect: { name: `crd-list` },
        children: [
          // crd
          {
            path: `${prefix}/crds`,
            name: `crd-list`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/resource/crd/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.crd',
              admin: true,
              icon: 'mdi-collage',
              show: true,
              rootName: 'admin-workspace',
              tip: 'crd',
            },
          },
          {
            path: `${prefix}/crds/:name`,
            name: `crd-detail`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/resource/crd/detail.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.crd',
              admin: true,
              icon: 'mdi-collage',
              show: false,
              rootName: 'admin-workspace',
              tip: 'crd',
            },
          },
        ],
      },
      {
        path: '',
        meta: {
          title: 'routerbar.cluster.g_storage',
          icon: 'mdi-database',
          required: ['cluster'],
        },
        component: (): Promise<typeof import('*.vue')> => import('@/layouts/Container.vue'),
        redirect: { name: `${namePrefix}-persistentvolumeclaim-list` },
        children: [
          // pvc
          {
            path: `${prefix}/persistentvolumeclaims`,
            name: `${namePrefix}-persistentvolumeclaim-list`,
            component: (): Promise<typeof import('*.vue')> =>
              import('@/views/resource/persistentvolumeclaim/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.persistentvolumeclaim',
              admin: true,
              icon: 'mdi-database',
              show: true,
              rootName: 'admin-workspace',
              tip: 'persistentvolumeclaim',
            },
          },
          {
            path: `${prefix}/persistentvolumeclaims/:name`,
            name: `${namePrefix}-persistentvolumeclaim-detail`,
            component: (): Promise<typeof import('*.vue')> =>
              import('@/views/resource/persistentvolumeclaim/detail.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.persistentvolumeclaim',
              admin: true,
              icon: 'mdi-database',
              show: false,
              rootName: 'admin-workspace',
              tip: 'persistentvolumeclaim',
            },
          },
          // volumesnapshot
          {
            path: `${prefix}/volumesnapshots`,
            name: `${namePrefix}-volumesnapshot-list`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/resource/volumesnapshot/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.volumesnapshot',
              icon: 'mdi-camera',
              show: true,
              rootName: 'admin-workspace',
              tip: 'volumesnapshot',
            },
          },
          // storageclass
          {
            path: `${prefix}/storageclasses`,
            name: `storageclass-center`,
            component: (): Promise<typeof import('*.vue')> => import('@/views/resource/storageclass/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.storageclass',
              admin: true,
              icon: 'mdi-database',
              show: true,
              rootName: 'admin-workspace',
              tip: 'storageclass',
            },
          },
        ],
      },
    ],
  },
  {
    path: '/console',
    name: 'admin-terminal',
    component: (): Promise<typeof import('*.vue')> => import('@/layouts/LayoutWithoutNavi.vue'),
    redirect: { name: `${namePrefix}-terminal-viewer` },
    children: [
      // terminal
      {
        path: `${prefix}/terminal/:name`,
        name: `${namePrefix}-terminal-viewer`,
        component: (): Promise<typeof import('*.vue')> => import('@/views/resource/terminal/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.terminal',
          admin: true,
        },
      },
    ],
  },
  {
    path: '/container',
    name: 'admin-container-log',
    component: (): Promise<typeof import('*.vue')> => import('@/layouts/LayoutWithoutNavi.vue'),
    redirect: { name: `${namePrefix}-container-log-viewer` },
    children: [
      // log
      {
        path: `${prefix}/log/:name`,
        name: `${namePrefix}-container-log-viewer`,
        component: (): Promise<typeof import('*.vue')> => import('@/views/resource/log/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.log',
          admin: true,
        },
      },
    ],
  },
];
