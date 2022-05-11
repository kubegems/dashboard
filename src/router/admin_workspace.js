const prefix = 'clusters/:cluster'
const namePrefix = 'admin'

export const adminWorkspace = [
  {
    path: '/',
    name: 'admin-workspace',
    component: () => import('@/layouts/Layout'),
    redirect: { name: 'cluster-center' },
    children: [
      {
        path: '',
        meta: {
          header: '集群',
          title: '集群管理',
          icon: 'mdi-server-network',
          required: ['cluster'],
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: 'cluster-center' },
        children: [
          // cluster
          {
            path: `${prefix}/clusters`,
            name: `cluster-center`,
            component: () => import('@/views/resource/cluster/index'),
            meta: {
              requireAuth: true,
              title: '资源概览',
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
            component: () => import('@/views/resource/cluster/detail'),
            meta: {
              requireAuth: true,
              title: '资源概览',
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
            component: () => import('@/views/resource/plugin/index'),
            meta: {
              requireAuth: true,
              title: '组件管理',
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
          header: '节点',
          title: '节点管理',
          icon: 'mdi-desktop-tower',
          required: ['cluster'],
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: 'node-list' },
        children: [
          // node
          {
            path: `${prefix}/nodes`,
            name: `node-list`,
            component: () => import('@/views/resource/node/index'),
            meta: {
              requireAuth: true,
              title: '节点',
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
            component: () => import('@/views/resource/node/detail'),
            meta: {
              requireAuth: true,
              title: '节点',
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
          header: '容器服务',
          title: '运行时',
          icon: 'mdi-application',
          required: ['cluster'],
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: `${namePrefix}-workload-list` },
        children: [
          // workload
          {
            path: `${prefix}/workloads`,
            name: `${namePrefix}-workload-list`,
            component: () => import('@/views/resource/workload/index'),
            meta: {
              requireAuth: true,
              title: '工作负载',
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
            component: () => import('@/views/resource/workload/detail'),
            meta: {
              requireAuth: true,
              title: '工作负载',
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
            component: () => import('@/views/resource/pod/index'),
            meta: {
              requireAuth: true,
              title: '容器组',
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
            component: () => import('@/views/resource/pod/detail'),
            meta: {
              requireAuth: true,
              title: '容器组',
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
            component: () => import('@/views/resource/service/index'),
            meta: {
              requireAuth: true,
              title: '服务',
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
            component: () => import('@/views/resource/service/detail'),
            meta: {
              requireAuth: true,
              title: '服务',
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
            component: () => import('@/views/resource/ingress/index'),
            meta: {
              requireAuth: true,
              title: '路由',
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
            component: () => import('@/views/resource/ingress/detail'),
            meta: {
              requireAuth: true,
              title: '路由',
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
            component: () => import('@/views/resource/gateway/index'),
            meta: {
              requireAuth: true,
              title: '网关',
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
            component: () => import('@/views/resource/gateway/detail'),
            meta: {
              requireAuth: true,
              title: '网关',
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
          title: '任务',
          icon: 'mdi-playlist-check',
          required: ['cluster'],
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: `${namePrefix}-job-list` },
        children: [
          // job
          {
            path: `${prefix}/jobs`,
            name: `${namePrefix}-job-list`,
            component: () => import('@/views/resource/job/index'),
            meta: {
              requireAuth: true,
              title: '任务',
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
            component: () => import('@/views/resource/job/detail'),
            meta: {
              requireAuth: true,
              title: '任务',
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
            component: () => import('@/views/resource/cronjob/index'),
            meta: {
              requireAuth: true,
              title: '定时任务',
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
            component: () => import('@/views/resource/cronjob/detail'),
            meta: {
              requireAuth: true,
              title: '定时任务',
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
          title: '配置中心',
          icon: 'mdi-brightness-7',
          required: ['cluster'],
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: `${namePrefix}-configmap-list` },
        children: [
          // configmap
          {
            path: `${prefix}/configmaps`,
            name: `${namePrefix}-configmap-list`,
            component: () => import('@/views/resource/configmap/index'),
            meta: {
              requireAuth: true,
              title: '配置',
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
            component: () => import('@/views/resource/configmap/detail'),
            meta: {
              requireAuth: true,
              title: '配置',
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
            component: () => import('@/views/resource/secret/index'),
            meta: {
              requireAuth: true,
              title: '密钥',
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
            component: () => import('@/views/resource/secret/detail'),
            meta: {
              requireAuth: true,
              title: '密钥',
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
            component: () => import('@/views/resource/certmanager/index'),
            meta: {
              requireAuth: true,
              title: '证书',
              admin: true,
              icon: 'mdi-book-open',
              show: true,
              rootName: 'admin-workspace',
              tip: 'certmanager',
            },
          },
          {
            path: `${prefix}/certmanager/:name`,
            name: `${namePrefix}-certificate-detail`,
            component: () => import('@/views/resource/certmanager/detail'),
            meta: {
              requireAuth: true,
              title: '证书',
              admin: true,
              icon: 'mdi-book-open',
              show: false,
              rootName: 'admin-workspace',
              tip: 'certmanager',
            },
          },
        ],
      },
      {
        path: '',
        meta: {
          title: '自定义资源',
          icon: 'mdi-arrow-down-box',
          required: ['cluster'],
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: `crd-list` },
        children: [
          // crd
          {
            path: `${prefix}/crds`,
            name: `crd-list`,
            component: () => import('@/views/resource/crd/index'),
            meta: {
              requireAuth: true,
              title: 'CRD',
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
            component: () => import('@/views/resource/crd/detail'),
            meta: {
              requireAuth: true,
              title: 'CRD',
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
          title: '存储中心',
          icon: 'mdi-database',
          dependencies: ['local_path'],
          required: ['cluster'],
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: `${namePrefix}-persistentvolumeclaim-list` },
        children: [
          // pvc
          {
            path: `${prefix}/persistentvolumeclaims`,
            name: `${namePrefix}-persistentvolumeclaim-list`,
            component: () => import('@/views/resource/persistentvolumeclaim/index'),
            meta: {
              requireAuth: true,
              title: '存储卷',
              admin: true,
              icon: 'mdi-database',
              show: true,
              rootName: 'admin-workspace',
              dependencies: ['local_path'],
              tip: 'persistentvolumeclaim',
            },
          },
          {
            path: `${prefix}/persistentvolumeclaims/:name`,
            name: `${namePrefix}-persistentvolumeclaim-detail`,
            component: () =>
              import('@/views/resource/persistentvolumeclaim/detail'),
            meta: {
              requireAuth: true,
              title: '存储卷',
              admin: true,
              icon: 'mdi-database',
              show: false,
              rootName: 'admin-workspace',
              dependencies: ['local_path'],
              tip: 'persistentvolumeclaim',
            },
          },
          // volumesnapshot
          {
            path: `${prefix}/volumesnapshots`,
            name: `${namePrefix}-volumesnapshot-list`,
            component: () => import('@/views/resource/volumesnapshot/index'),
            meta: {
              requireAuth: true,
              title: '存储卷快照',
              icon: 'mdi-camera',
              show: true,
              rootName: 'admin-workspace',
              dependencies: ['local_path'],
              tip: 'volumesnapshot',
            },
          },
          // storageclass
          {
            path: `${prefix}/storageclasses`,
            name: `storageclass-center`,
            component: () => import('@/views/resource/storageclass/index'),
            meta: {
              requireAuth: true,
              title: '存储类型',
              admin: true,
              icon: 'mdi-database',
              show: true,
              rootName: 'admin-workspace',
              dependencies: ['local_path'],
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
    component: () => import('@/layouts/LayoutWithoutNavi'),
    redirect: { name: `${namePrefix}-terminal-viewer` },
    children: [
      // terminal
      {
        path: `${prefix}/terminal/:name`,
        name: `${namePrefix}-terminal-viewer`,
        component: () => import('@/views/resource/terminal/index'),
        meta: {
          requireAuth: true,
          title: '终端',
          admin: true,
        },
      },
    ],
  },
  {
    path: '/container',
    name: 'admin-container-log',
    component: () => import('@/layouts/LayoutWithoutNavi'),
    redirect: { name: `${namePrefix}-container-log-viewer` },
    children: [
      // log
      {
        path: `${prefix}/log/:name`,
        name: `${namePrefix}-container-log-viewer`,
        component: () => import('@/views/resource/log/index'),
        meta: {
          requireAuth: true,
          title: '容器日志',
          admin: true,
        },
      },
    ],
  },
]
