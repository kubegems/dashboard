import { RouteConfig } from 'vue-router';

const projectPrefix = 'tenants/:tenant?/projects/:project?';
export const projectWorkspace: RouteConfig[] = [
  {
    path: '',
    meta: {
      header: 'routerbar.cluster.h_dashboard',
      title: 'routerbar.cluster.g_dashboard',
      icon: 'mdi-view-dashboard',
    },
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: 'project-detail' },
    children: [
      // project
      {
        path: `${projectPrefix}/dashboard-project`,
        name: 'project-detail',
        component: () => import('./src/views/resource/project/detail.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.project_dashboard',
          icon: 'mdi-view-dashboard',
          show: true,
          rootName: 'project',
          tip: 'project',
        },
      },
    ],
  },
  {
    path: '',
    meta: {
      header: 'routerbar.cluster.h_appmanifest',
      title: 'routerbar.cluster.g_app',
      icon: 'mdi-view-grid',
    },
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: 'appmanifest-list' },
    children: [
      // app
      {
        path: `${projectPrefix}/appmanifests`,
        name: 'appmanifest-list',
        component: () => import('./src/views/resource/appmanifest/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.app_manifest',
          icon: 'mdi-apps',
          show: true,
          rootName: 'project',
          tip: 'appmanifest',
        },
      },
      {
        path: `${projectPrefix}/appmanifests/:name`,
        name: 'appmanifest-detail',
        component: () => import('./src/views/resource/appmanifest/detail.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.app_manifest',
          icon: 'mdi-apps',
          show: false,
          rootName: 'project',
          tip: 'appmanifest',
        },
      },
      // registry
      {
        path: `${projectPrefix}/registrys`,
        name: 'registry-list',
        component: () => import('./src/views/resource/registry/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.registry',
          icon: 'mdi-database',
          show: true,
          rootName: 'project',
          tip: 'registry',
        },
      },
    ],
  },
];

const dashboardPrefix = 'tenants/:tenant?';
export const dashboard: RouteConfig[] = [
  {
    path: '',
    meta: {
      header: 'routerbar.cluster.h_dashboard',
      title: 'routerbar.cluster.g_dashboard',
      icon: 'mdi-view-dashboard',
      required: ['tenant'],
    },
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: 'resource-dashboard' },
    children: [
      // dashboard
      {
        path: `${dashboardPrefix}/dashboard-tenant`,
        name: 'resource-dashboard',
        component: () => import('./src/views/resource/dashboard/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.environment_dashboard',
          icon: 'mdi-view-dashboard',
          show: true,
          rootName: 'dashboard',
          tip: 'dashboard',
        },
      },
    ],
  },
  {
    path: '',
    meta: {
      header: 'routerbar.cluster.h_space',
      title: 'routerbar.cluster.g_space',
      icon: 'mdi-view-grid',
      required: ['tenant'],
    },
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: 'appmanifest-list' },
    children: [
      // project
      {
        path: `${dashboardPrefix}/projects`,
        name: 'project-list',
        component: () => import('./src/views/resource/project/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.project',
          icon: 'mdi-view-dashboard',
          show: true,
          rootName: 'dashboard',
          tip: 'project',
        },
      },
    ],
  },
];

const workspacePrefix = 'tenants/:tenant?/projects/:project?/environments/:environment?';
export const workspace: RouteConfig[] = [
  {
    path: '',
    meta: {
      header: 'routerbar.cluster.h_dashboard',
      title: 'routerbar.cluster.g_dashboard',
      icon: 'mdi-view-dashboard',
      required: ['tenant'],
    },
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: 'environment-detail' },
    children: [
      // environment
      {
        path: `${workspacePrefix}/dashboard-environment`,
        name: 'environment-detail',
        component: () => import('./src/views/resource/environment/detail.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.environment_dashboard',
          icon: 'mdi-cloud',
          show: true,
          rootName: 'workspace',
          tip: 'environment',
          edge: false,
        },
      },
      {
        path: `${workspacePrefix}/:name/dashboard-edge`,
        name: 'edge-detail',
        component: () => import('./src/views/resource/edge/detail.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.edge_dashboard',
          icon: 'mdi-desktop-tower',
          show: true,
          rootName: 'workspace',
          tip: 'edge',
          edge: true,
        },
      },
    ],
  },
  {
    path: '',
    meta: {
      header: 'routerbar.cluster.h_app',
      title: 'routerbar.cluster.h_app',
      icon: 'mdi-view-grid',
      required: ['tenant'],
      edge: false,
    },
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: 'app-list' },
    children: [
      // app
      {
        path: `${workspacePrefix}/apps`,
        name: 'app-list',
        component: () => import('./src/views/resource/app/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.app',
          icon: 'mdi-apps',
          show: true,
          rootName: 'workspace',
          tip: 'app',
          edge: false,
        },
      },
      {
        path: `${workspacePrefix}/configs`,
        name: 'app-configer',
        component: () => import('./src/views/resource/app_configer/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.app_config',
          icon: 'mdi-wrench',
          show: false,
          pluginOpenShow: true,
          rootName: 'workspace',
          tip: 'appconfig',
          dependencies: ['nacos'],
          edge: false,
        },
      },
      {
        path: `${workspacePrefix}/apps/:name`,
        name: 'app-detail',
        component: () => import('./src/views/resource/app/detail.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.app',
          icon: 'mdi-apps',
          show: false,
          rootName: 'workspace',
          tip: 'app',
          edge: false,
        },
      },
      {
        path: `${workspacePrefix}/apps/:name/deploy`,
        name: 'app-deploy',
        component: () => import('./src/views/resource/deploy/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.app_deploy',
          icon: 'mdi-apps',
          show: false,
          rootName: 'workspace',
          tip: 'deploy',
          dependencies: ['argo-rollouts'],
          edge: false,
        },
      },
    ],
  },
  {
    path: '',
    meta: {
      header: 'routerbar.cluster.h_edge',
      title: 'routerbar.cluster.h_edge',
      icon: 'mdi-server',
      required: ['tenant'],
      edge: 'check',
    },
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: 'edge-list' },
    children: [
      // app
      {
        path: `${workspacePrefix}/edges`,
        name: 'edge-list',
        component: () => import('./src/views/resource/edge/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.edge',
          icon: 'mdi-desktop-tower',
          show: true,
          rootName: 'workspace',
          tip: 'edge',
          edge: 'check',
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
      required: ['tenant'],
    },
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: `workload-list` },
    children: [
      // workload
      {
        path: `${workspacePrefix}/workloads`,
        name: 'workload-list',
        component: () => import('./src/views/resource/workload/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.workload',
          upToAdmin: true,
          icon: 'mdi-vector-arrange-above',
          show: true,
          rootName: 'workspace',
          tip: 'workload',
        },
      },
      {
        path: `${workspacePrefix}/workloads/:name`,
        name: 'workload-detail',
        component: () => import('./src/views/resource/workload/detail.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.workload',
          upToAdmin: true,
          icon: 'mdi-vector-arrange-above',
          show: false,
          rootName: 'workspace',
          tip: 'workload',
        },
      },
      // pod
      {
        path: `${workspacePrefix}/pods`,
        name: 'pod-list',
        component: () => import('./src/views/resource/pod/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.pod',
          upToAdmin: true,
          icon: 'mdi-microsoft',
          show: true,
          rootName: 'workspace',
          tip: 'pod',
        },
      },
      {
        path: `${workspacePrefix}/pods/:name`,
        name: 'pod-detail',
        component: () => import('./src/views/resource/pod/detail.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.pod',
          upToAdmin: true,
          icon: 'mdi-microsoft',
          show: false,
          rootName: 'workspace',
          tip: 'pod',
        },
      },
      // service
      {
        path: `${workspacePrefix}/services`,
        name: 'service-list',
        component: () => import('./src/views/resource/service/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.service',
          upToAdmin: true,
          icon: 'mdi-dns',
          show: true,
          rootName: 'workspace',
          tip: 'service',
        },
      },
      {
        path: `${workspacePrefix}/services/:name`,
        name: 'service-detail',
        component: () => import('./src/views/resource/service/detail.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.service',
          upToAdmin: true,
          icon: 'mdi-dns',
          show: false,
          rootName: 'workspace',
          tip: 'service',
        },
      },
      // ingress
      {
        path: `${workspacePrefix}/ingress`,
        name: 'ingress-list',
        component: () => import('./src/views/resource/ingress/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.ingress',
          upToAdmin: true,
          icon: 'mdi-network',
          show: true,
          rootName: 'workspace',
          tip: 'ingress',
        },
      },
      {
        path: `${workspacePrefix}/ingress/:name`,
        name: 'ingress-detail',
        component: () => import('./src/views/resource/ingress/detail.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.ingress',
          upToAdmin: true,
          icon: 'mdi-network',
          show: false,
          rootName: 'workspace',
          tip: 'ingress',
        },
      },
      // gateway
      {
        path: `${workspacePrefix}/gateways`,
        name: 'gateway-center',
        component: () => import('./src/views/resource/gateway/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.gateway',
          upToAdmin: true,
          icon: 'mdi-gate',
          show: true,
          rootName: 'workspace',
          tip: 'gateway',
          edge: false,
        },
      },
      {
        path: `${workspacePrefix}/gateways/:name`,
        name: 'gateway-detail',
        component: () => import('./src/views/resource/gateway/detail.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.gateway',
          upToAdmin: true,
          icon: 'mdi-gate',
          show: false,
          rootName: 'workspace',
          tip: 'gateway',
          edge: false,
        },
      },
    ],
  },
  {
    path: '',
    meta: {
      title: 'routerbar.cluster.g_task',
      icon: 'mdi-playlist-check',
      required: ['tenant'],
    },
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: `job-list` },
    children: [
      // job
      {
        path: `${workspacePrefix}/jobs`,
        name: 'job-list',
        component: () => import('./src/views/resource/job/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.job',
          upToAdmin: true,
          icon: 'mdi-repeat-once',
          show: true,
          rootName: 'workspace',
          tip: 'job',
        },
      },
      {
        path: `${workspacePrefix}/jobs/:name`,
        name: 'job-detail',
        component: () => import('./src/views/resource/job/detail.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.job',
          upToAdmin: true,
          icon: 'mdi-repeat-once',
          show: false,
          rootName: 'workspace',
          tip: 'job',
        },
      },
      // cronjob
      {
        path: `${workspacePrefix}/cronjobs`,
        name: 'cronjob-list',
        component: () => import('./src/views/resource/cronjob/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.cronjob',
          upToAdmin: true,
          icon: 'mdi-calendar-clock',
          show: true,
          rootName: 'workspace',
          tip: 'cronjob',
        },
      },
      {
        path: `${workspacePrefix}/cronjobs/:name`,
        name: 'cronjob-detail',
        component: () => import('./src/views/resource/cronjob/detail.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.cronjob',
          upToAdmin: true,
          icon: 'mdi-calendar-clock',
          show: false,
          rootName: 'workspace',
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
      required: ['tenant'],
    },
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: `configmap-list` },
    children: [
      // configmap
      {
        path: `${workspacePrefix}/configmaps`,
        name: 'configmap-list',
        component: () => import('./src/views/resource/configmap/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.configmap',
          upToAdmin: true,
          icon: 'mdi-wrench',
          show: true,
          rootName: 'workspace',
          tip: 'configmap',
        },
      },
      {
        path: `${workspacePrefix}/configmaps/:name`,
        name: 'configmap-detail',
        component: () => import('./src/views/resource/configmap/detail.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.configmap',
          upToAdmin: true,
          icon: 'mdi-wrench',
          show: false,
          rootName: 'workspace',
          tip: 'configmap',
        },
      },
      // secret
      {
        path: `${workspacePrefix}/secrets`,
        name: 'secret-list',
        component: () => import('./src/views/resource/secret/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.secret',
          upToAdmin: true,
          icon: 'mdi-key-variant',
          show: true,
          rootName: 'workspace',
          tip: 'secret',
        },
      },
      {
        path: `${workspacePrefix}/secrets/:name`,
        name: 'secret-detail',
        component: () => import('./src/views/resource/secret/detail.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.secret',
          upToAdmin: true,
          icon: 'mdi-key-variant',
          show: false,
          rootName: 'workspace',
          tip: 'secret',
        },
      },
      // certmanager
      {
        path: `${workspacePrefix}/certmanager`,
        name: 'certmanager',
        component: () => import('./src/views/resource/certmanager/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.certmanager',
          upToAdmin: true,
          icon: 'mdi-book-open',
          show: true,
          rootName: 'workspace',
          tip: 'certmanager',
          dependencies: ['cert-manager'],
          edge: false,
        },
      },
      {
        path: `${workspacePrefix}/certmanager/:name`,
        name: 'certificate-detail',
        component: () => import('./src/views/resource/certmanager/detail.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.certmanager',
          upToAdmin: true,
          icon: 'mdi-book-open',
          show: false,
          rootName: 'workspace',
          tip: 'certmanager',
          dependencies: ['cert-manager'],
          edge: false,
        },
      },
    ],
  },
  {
    path: '',
    meta: {
      title: 'routerbar.cluster.g_storage',
      icon: 'mdi-database',
      required: ['tenant'],
    },
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: `persistentvolumeclaim-list` },
    children: [
      // pvc
      {
        path: `${workspacePrefix}/persistentvolumeclaims`,
        name: 'persistentvolumeclaim-list',
        component: () => import('./src/views/resource/persistentvolumeclaim/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.persistentvolumeclaim',
          upToAdmin: true,
          icon: 'mdi-database',
          show: true,
          rootName: 'workspace',
          tip: 'persistentvolumeclaim',
        },
      },
      {
        path: `${workspacePrefix}/persistentvolumeclaims/:name`,
        name: 'persistentvolumeclaim-detail',
        component: () => import('./src/views/resource/persistentvolumeclaim/detail.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.persistentvolumeclaim',
          upToAdmin: true,
          icon: 'mdi-database',
          show: false,
          rootName: 'workspace',
          tip: 'persistentvolumeclaim',
        },
      },
      // volumesnapshot
      {
        path: `${workspacePrefix}/volumesnapshots`,
        name: 'volumesnapshot-list',
        component: () => import('./src/views/resource/volumesnapshot/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.volumesnapshot',
          upToAdmin: true,
          icon: 'mdi-camera',
          show: true,
          rootName: 'workspace',
          tip: 'volumesnapshot',
          edge: false,
        },
      },
      // storageclass
      {
        path: `${workspacePrefix}/storageclasses`,
        name: `storageclass-center`,
        component: () => import('./src/views/resource/storageclass/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.storageclass',
          upToAdmin: true,
          icon: 'mdi-database',
          show: true,
          rootName: 'workspace',
          tip: 'storageclass',
          edge: true,
        },
      },
    ],
  },
];

const adminPrefix = 'clusters/:cluster?';
const namePrefix = 'admin';

export const adminWorkspace: RouteConfig[] = [
  {
    path: '',
    meta: {
      header: 'routerbar.cluster.h_cluster',
      title: 'routerbar.cluster.g_cluster',
      icon: 'mdi-server-network',
      required: ['cluster'],
    },
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: 'cluster-center' },
    children: [
      // cluster
      {
        path: `${adminPrefix}/clusters`,
        name: `cluster-center`,
        component: () => import('./src/views/resource/cluster/index.vue'),
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
        path: `${adminPrefix}/clusters/:name`,
        name: `cluster-detail`,
        component: () => import('./src/views/resource/cluster/detail.vue'),
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
        path: `${adminPrefix}/plugins`,
        name: `plugin-center`,
        component: () => import('./src/views/resource/plugin/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.plugins',
          admin: true,
          icon: 'mdi-power-plug',
          show: true,
          rootName: 'admin-workspace',
          tip: 'plugin',
          edge: false,
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
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: 'node-list' },
    children: [
      // node
      {
        path: `${adminPrefix}/nodes`,
        name: `node-list`,
        component: () => import('./src/views/resource/node/index.vue'),
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
        path: `${adminPrefix}/nodes/:name`,
        name: `node-detail`,
        component: () => import('./src/views/resource/node/detail.vue'),
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
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: `${namePrefix}-workload-list` },
    children: [
      // workload
      {
        path: `${adminPrefix}/workloads`,
        name: `${namePrefix}-workload-list`,
        component: () => import('./src/views/resource/workload/index.vue'),
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
        path: `${adminPrefix}/workloads/:name`,
        name: `${namePrefix}-workload-detail`,
        component: () => import('./src/views/resource/workload/detail.vue'),
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
        path: `${adminPrefix}/pods`,
        name: `${namePrefix}-pod-list`,
        component: () => import('./src/views/resource/pod/index.vue'),
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
        path: `${adminPrefix}/pods/:name`,
        name: `${namePrefix}-pod-detail`,
        component: () => import('./src/views/resource/pod/detail.vue'),
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
        path: `${adminPrefix}/services`,
        name: `${namePrefix}-service-list`,
        component: () => import('./src/views/resource/service/index.vue'),
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
        path: `${adminPrefix}/services/:name`,
        name: `${namePrefix}-service-detail`,
        component: () => import('./src/views/resource/service/detail.vue'),
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
        path: `${adminPrefix}/ingress`,
        name: `${namePrefix}-ingress-list`,
        component: () => import('./src/views/resource/ingress/index.vue'),
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
        path: `${adminPrefix}/ingress/:name`,
        name: `${namePrefix}-ingress-detail`,
        component: () => import('./src/views/resource/ingress/detail.vue'),
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
        path: `${adminPrefix}/gateways`,
        name: `${namePrefix}-gateway-center`,
        component: () => import('./src/views/resource/gateway/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.gateway',
          admin: true,
          icon: 'mdi-gate',
          show: true,
          rootName: 'admin-workspace',
          tip: 'gateway',
          edge: false,
        },
      },
      {
        path: `${adminPrefix}/gateways/:name`,
        name: `${namePrefix}-gateway-detail`,
        component: () => import('./src/views/resource/gateway/detail.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.gateway',
          admin: true,
          icon: 'mdi-gate',
          show: false,
          rootName: 'admin-workspace',
          tip: 'gateway',
          edge: false,
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
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: `${namePrefix}-job-list` },
    children: [
      // job
      {
        path: `${adminPrefix}/jobs`,
        name: `${namePrefix}-job-list`,
        component: () => import('./src/views/resource/job/index.vue'),
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
        path: `${adminPrefix}/jobs/:name`,
        name: `${namePrefix}-job-detail`,
        component: () => import('./src/views/resource/job/detail.vue'),
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
        path: `${adminPrefix}/cronjobs`,
        name: `${namePrefix}-cronjob-list`,
        component: () => import('./src/views/resource/cronjob/index.vue'),
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
        path: `${adminPrefix}/cronjobs/:name`,
        name: `${namePrefix}-cronjob-detail`,
        component: () => import('./src/views/resource/cronjob/detail.vue'),
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
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: `${namePrefix}-configmap-list` },
    children: [
      // configmap
      {
        path: `${adminPrefix}/configmaps`,
        name: `${namePrefix}-configmap-list`,
        component: () => import('./src/views/resource/configmap/index.vue'),
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
        path: `${adminPrefix}/configmaps/:name`,
        name: `${namePrefix}-configmap-detail`,
        component: () => import('./src/views/resource/configmap/detail.vue'),
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
        path: `${adminPrefix}/secrets`,
        name: `${namePrefix}-secret-list`,
        component: () => import('./src/views/resource/secret/index.vue'),
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
        path: `${adminPrefix}/secrets/:name`,
        name: `${namePrefix}-secret-detail`,
        component: () => import('./src/views/resource/secret/detail.vue'),
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
        path: `${adminPrefix}/certmanager`,
        name: `${namePrefix}-certmanager`,
        component: () => import('./src/views/resource/certmanager/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.certmanager',
          admin: true,
          icon: 'mdi-book-open',
          show: true,
          rootName: 'admin-workspace',
          tip: 'certmanager',
          dependencies: ['cert-manager'],
          edge: false,
        },
      },
      {
        path: `${adminPrefix}/certmanager/:name`,
        name: `${namePrefix}-certificate-detail`,
        component: () => import('./src/views/resource/certmanager/detail.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.certmanager',
          admin: true,
          icon: 'mdi-book-open',
          show: false,
          rootName: 'admin-workspace',
          tip: 'certmanager',
          dependencies: ['cert-manager'],
          edge: false,
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
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: `crd-list` },
    children: [
      // crd
      {
        path: `${adminPrefix}/crds`,
        name: `crd-list`,
        component: () => import('./src/views/resource/crd/index.vue'),
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
        path: `${adminPrefix}/crds/:name`,
        name: `crd-detail`,
        component: () => import('./src/views/resource/crd/detail.vue'),
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
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: `${namePrefix}-persistentvolumeclaim-list` },
    children: [
      // pvc
      {
        path: `${adminPrefix}/persistentvolumeclaims`,
        name: `${namePrefix}-persistentvolumeclaim-list`,
        component: () => import('./src/views/resource/persistentvolumeclaim/index.vue'),
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
        path: `${adminPrefix}/persistentvolumeclaims/:name`,
        name: `${namePrefix}-persistentvolumeclaim-detail`,
        component: () => import('./src/views/resource/persistentvolumeclaim/detail.vue'),
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
        path: `${adminPrefix}/volumesnapshots`,
        name: `${namePrefix}-volumesnapshot-list`,
        component: () => import('./src/views/resource/volumesnapshot/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.volumesnapshot',
          icon: 'mdi-camera',
          show: true,
          rootName: 'admin-workspace',
          tip: 'volumesnapshot',
          edge: false,
        },
      },
      // storageclass
      {
        path: `${adminPrefix}/storageclasses`,
        name: `${namePrefix}-storageclass-center`,
        component: () => import('./src/views/resource/storageclass/index.vue'),
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
];

export const singleRouter: RouteConfig[] = [
  {
    path: '/console',
    name: 'terminal',
    component: () => import('@kubegems/components/layouts/LayoutWithoutNavi.vue'),
    redirect: { name: 'terminal-viewer' },
    children: [
      // terminal
      {
        path: `${workspacePrefix}/terminal/:name`,
        name: 'terminal-viewer',
        component: () => import('./src/views/resource/terminal/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.terminal',
          upToAdmin: true,
        },
      },
    ],
  },
  {
    path: '/container',
    name: 'container-log',
    component: () => import('@kubegems/components/layouts/LayoutWithoutNavi.vue'),
    redirect: { name: 'container-log-viewer' },
    children: [
      // terminal
      {
        path: `${workspacePrefix}/log/:name`,
        name: 'container-log-viewer',
        component: () => import('./src/views/resource/log/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.log',
          upToAdmin: true,
        },
      },
    ],
  },

  {
    path: '/console',
    name: 'admin-terminal',
    component: () => import('@kubegems/components/layouts/LayoutWithoutNavi.vue'),
    redirect: { name: `${namePrefix}-terminal-viewer` },
    children: [
      // terminal
      {
        path: `${adminPrefix}/terminal/:name`,
        name: `${namePrefix}-terminal-viewer`,
        component: () => import('./src/views/resource/terminal/index.vue'),
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
    component: () => import('@kubegems/components/layouts/LayoutWithoutNavi.vue'),
    redirect: { name: `${namePrefix}-container-log-viewer` },
    children: [
      // log
      {
        path: `${adminPrefix}/log/:name`,
        name: `${namePrefix}-container-log-viewer`,
        component: () => import('./src/views/resource/log/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.cluster.log',
          admin: true,
        },
      },
    ],
  },
];
