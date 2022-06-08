const prefix = 'tenants/:tenant/projects/:project/environments/:environment'

export const workspace = [
  {
    path: '/',
    name: 'workspace',
    component: () => import('@/layouts/Layout'),
    redirect: { name: 'environment-detail' },
    children: [
      {
        path: '',
        meta: {
          header: '首页',
          title: '首页',
          icon: 'mdi-view-dashboard',
          required: ['tenant'],
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: 'environment-detail' },
        children: [
          // environment
          {
            path: `${prefix}/dashboard-environment`,
            name: 'environment-detail',
            component: () => import('@/views/resource/environment/detail'),
            meta: {
              requireAuth: true,
              title: '环境资源',
              icon: 'mdi-cube',
              show: true,
              rootName: 'workspace',
            },
          },
        ],
      },
      {
        path: '',
        meta: {
          header: '应用中心',
          title: '应用中心',
          icon: 'mdi-apps',
          required: ['tenant'],
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: 'app-list' },
        children: [
          // app
          {
            path: `${prefix}/apps`,
            name: 'app-list',
            component: () => import('@/views/resource/app/index'),
            meta: {
              requireAuth: true,
              title: '应用',
              icon: 'mdi-apps',
              show: true,
              rootName: 'workspace',
            },
          },
          {
            path: `${prefix}/configs`,
            name: 'app-configer',
            component: () => import('@/views/resource/app-configer/index'),
            meta: {
              requireAuth: true,
              title: '应用配置',
              icon: 'mdi-apps',
              show: true,
              rootName: 'workspace',
            },
          },
          {
            path: `${prefix}/apps/:name`,
            name: 'app-detail',
            component: () => import('@/views/resource/app/detail'),
            meta: {
              requireAuth: true,
              title: '应用',
              icon: 'mdi-apps',
              show: false,
              rootName: 'workspace',
            },
          },
          {
            path: `${prefix}/apps/:name/deploy`,
            name: 'app-deploy',
            component: () => import('@/views/resource/deploy/index'),
            meta: {
              requireAuth: true,
              title: '应用部署',
              icon: 'mdi-apps',
              show: false,
              rootName: 'workspace',
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
          required: ['tenant'],
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: `workload-list` },
        children: [
          // workload
          {
            path: `${prefix}/workloads`,
            name: 'workload-list',
            component: () => import('@/views/resource/workload/index'),
            meta: {
              requireAuth: true,
              title: '工作负载',
              upToAdmin: true,
              icon: 'mdi-vector-arrange-above',
              show: true,
              rootName: 'workspace',
            },
          },
          {
            path: `${prefix}/workloads/:name`,
            name: 'workload-detail',
            component: () => import('@/views/resource/workload/detail'),
            meta: {
              requireAuth: true,
              title: '工作负载',
              upToAdmin: true,
              icon: 'mdi-vector-arrange-above',
              show: false,
              rootName: 'workspace',
            },
          },
          // pod
          {
            path: `${prefix}/pods`,
            name: 'pod-list',
            component: () => import('@/views/resource/pod/index'),
            meta: {
              requireAuth: true,
              title: '容器组',
              upToAdmin: true,
              icon: 'mdi-microsoft',
              show: true,
              rootName: 'workspace',
            },
          },
          {
            path: `${prefix}/pods/:name`,
            name: 'pod-detail',
            component: () => import('@/views/resource/pod/detail'),
            meta: {
              requireAuth: true,
              title: '容器组',
              upToAdmin: true,
              icon: 'mdi-microsoft',
              show: false,
              rootName: 'workspace',
            },
          },
          // service
          {
            path: `${prefix}/services`,
            name: 'service-list',
            component: () => import('@/views/resource/service/index'),
            meta: {
              requireAuth: true,
              title: '服务',
              upToAdmin: true,
              icon: 'mdi-dns',
              show: true,
              rootName: 'workspace',
            },
          },
          {
            path: `${prefix}/services/:name`,
            name: 'service-detail',
            component: () => import('@/views/resource/service/detail'),
            meta: {
              requireAuth: true,
              title: '服务',
              upToAdmin: true,
              icon: 'mdi-dns',
              show: false,
              rootName: 'workspace',
            },
          },
          // ingress
          {
            path: `${prefix}/ingress`,
            name: 'ingress-list',
            component: () => import('@/views/resource/ingress/index'),
            meta: {
              requireAuth: true,
              title: '路由',
              upToAdmin: true,
              icon: 'mdi-network',
              show: true,
              rootName: 'workspace',
            },
          },
          {
            path: `${prefix}/ingress/:name`,
            name: 'ingress-detail',
            component: () => import('@/views/resource/ingress/detail'),
            meta: {
              requireAuth: true,
              title: '路由',
              upToAdmin: true,
              icon: 'mdi-network',
              show: false,
              rootName: 'workspace',
            },
          },
          // gateway
          {
            path: `${prefix}/gateways`,
            name: 'gateway-center',
            component: () => import('@/views/resource/gateway/index'),
            meta: {
              requireAuth: true,
              title: '网关',
              upToAdmin: true,
              icon: 'mdi-gate',
              show: true,
              rootName: 'workspace',
            },
          },
          {
            path: `${prefix}/gateways/:name`,
            name: 'gateway-detail',
            component: () => import('@/views/resource/gateway/detail'),
            meta: {
              requireAuth: true,
              title: '网关',
              upToAdmin: true,
              icon: 'mdi-gate',
              show: false,
              rootName: 'workspace',
            },
          },
        ],
      },
      {
        path: '',
        meta: {
          title: '任务',
          icon: 'mdi-playlist-check',
          required: ['tenant'],
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: `job-list` },
        children: [
          // job
          {
            path: `${prefix}/jobs`,
            name: 'job-list',
            component: () => import('@/views/resource/job/index'),
            meta: {
              requireAuth: true,
              title: '任务',
              upToAdmin: true,
              icon: 'mdi-repeat-once',
              show: true,
              rootName: 'workspace',
            },
          },
          {
            path: `${prefix}/jobs/:name`,
            name: 'job-detail',
            component: () => import('@/views/resource/job/detail'),
            meta: {
              requireAuth: true,
              title: '任务',
              upToAdmin: true,
              icon: 'mdi-repeat-once',
              show: false,
              rootName: 'workspace',
            },
          },
          // cronjob
          {
            path: `${prefix}/cronjobs`,
            name: 'cronjob-list',
            component: () => import('@/views/resource/cronjob/index'),
            meta: {
              requireAuth: true,
              title: '定时任务',
              upToAdmin: true,
              icon: 'mdi-calendar-clock',
              show: true,
              rootName: 'workspace',
            },
          },
          {
            path: `${prefix}/cronjobs/:name`,
            name: 'cronjob-detail',
            component: () => import('@/views/resource/cronjob/detail'),
            meta: {
              requireAuth: true,
              title: '定时任务',
              upToAdmin: true,
              icon: 'mdi-calendar-clock',
              show: false,
              rootName: 'workspace',
            },
          },
        ],
      },
      {
        path: '',
        meta: {
          title: '配置中心',
          icon: 'mdi-brightness-7',
          required: ['tenant'],
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: `configmap-list` },
        children: [
          // configmap
          {
            path: `${prefix}/configmaps`,
            name: 'configmap-list',
            component: () => import('@/views/resource/configmap/index'),
            meta: {
              requireAuth: true,
              title: '配置',
              upToAdmin: true,
              icon: 'mdi-wrench',
              show: true,
              rootName: 'workspace',
            },
          },
          {
            path: `${prefix}/configmaps/:name`,
            name: 'configmap-detail',
            component: () => import('@/views/resource/configmap/detail'),
            meta: {
              requireAuth: true,
              title: '配置',
              upToAdmin: true,
              icon: 'mdi-wrench',
              show: false,
              rootName: 'workspace',
            },
          },
          // secret
          {
            path: `${prefix}/secrets`,
            name: 'secret-list',
            component: () => import('@/views/resource/secret/index'),
            meta: {
              requireAuth: true,
              title: '密钥',
              upToAdmin: true,
              icon: 'mdi-key-variant',
              show: true,
              rootName: 'workspace',
            },
          },
          {
            path: `${prefix}/secrets/:name`,
            name: 'secret-detail',
            component: () => import('@/views/resource/secret/detail'),
            meta: {
              requireAuth: true,
              title: '密钥',
              upToAdmin: true,
              icon: 'mdi-key-variant',
              show: false,
              rootName: 'workspace',
            },
          },
          // certmanager
          {
            path: `${prefix}/certmanager`,
            name: 'certmanager',
            component: () => import('@/views/resource/certmanager/index'),
            meta: {
              requireAuth: true,
              title: '证书',
              upToAdmin: true,
              icon: 'mdi-book-open',
              show: true,
              rootName: 'workspace',
            },
          },
          {
            path: `${prefix}/certmanager/:name`,
            name: 'certificate-detail',
            component: () => import('@/views/resource/certmanager/detail'),
            meta: {
              requireAuth: true,
              title: '证书',
              upToAdmin: true,
              icon: 'mdi-book-open',
              show: false,
              rootName: 'workspace',
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
          required: ['tenant'],
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: `persistentvolumeclaim-list` },
        children: [
          // pvc
          {
            path: `${prefix}/persistentvolumeclaims`,
            name: 'persistentvolumeclaim-list',
            component: () => import('@/views/resource/persistentvolumeclaim/index'),
            meta: {
              requireAuth: true,
              title: '存储卷',
              upToAdmin: true,
              icon: 'mdi-database',
              show: true,
              rootName: 'workspace',
              dependencies: ['local_path'],
            },
          },
          {
            path: `${prefix}/persistentvolumeclaims/:name`,
            name: 'persistentvolumeclaim-detail',
            component: () =>
              import('@/views/resource/persistentvolumeclaim/detail'),
            meta: {
              requireAuth: true,
              title: '存储卷',
              upToAdmin: true,
              icon: 'mdi-database',
              show: false,
              rootName: 'workspace',
              dependencies: ['local_path'],
            },
          },
          // volumesnapshot
          {
            path: `${prefix}/volumesnapshots`,
            name: 'volumesnapshot-list',
            component: () => import('@/views/resource/volumesnapshot/index'),
            meta: {
              requireAuth: true,
              title: '存储卷快照',
              upToAdmin: true,
              icon: 'mdi-camera',
              show: true,
              rootName: 'workspace',
              dependencies: ['local_path'],
            },
          },
        ],
      },
      {
        path: '',
        meta: {
          title: '监控中心',
          icon: 'mdi-chart-bar',
          dependencies: ['monitoring'],
          required: ['tenant'],
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: `servicemonitor-list` },
        children: [
          // servicemonitor
          {
            path: `${prefix}/servicemonitors`,
            name: 'servicemonitor-list',
            component: () => import('@/views/resource/servicemonitor/index'),
            meta: {
              requireAuth: true,
              title: '监控采集器',
              upToAdmin: true,
              icon: 'mdi-eyedropper',
              show: true,
              rootName: 'workspace',
              dependencies: ['monitoring'],
            },
          },
          {
            path: `${prefix}/servicemonitors/:name`,
            name: 'servicemonitor-detail',
            component: () => import('@/views/resource/servicemonitor/detail'),
            meta: {
              requireAuth: true,
              title: '监控采集器',
              upToAdmin: true,
              icon: 'mdi-eyedropper',
              show: false,
              rootName: 'workspace',
              dependencies: ['monitoring'],
            },
          },
          // prometheusrule
          {
            path: `${prefix}/prometheusrules`,
            name: 'prometheusrule-list',
            component: () => import('@/views/resource/prometheusrule/index'),
            meta: {
              requireAuth: true,
              title: '告警规则',
              upToAdmin: true,
              icon: 'mdi-ruler',
              show: true,
              rootName: 'workspace',
              dependencies: ['monitoring'],
            },
          },
          {
            path: `${prefix}/prometheusrules/:name`,
            name: 'prometheusrule-detail',
            component: () => import('@/views/resource/prometheusrule/detail'),
            meta: {
              requireAuth: true,
              title: '告警规则',
              upToAdmin: true,
              icon: 'mdi-ruler',
              show: false,
              rootName: 'workspace',
              dependencies: ['monitoring'],
            },
          },
          // receivers
          {
            path: `${prefix}/receivers`,
            name: 'receiver-list',
            component: () => import('@/views/resource/receiver/index'),
            meta: {
              requireAuth: true,
              title: '告警接收器',
              upToAdmin: true,
              icon: 'mdi-call-received',
              show: true,
              rootName: 'workspace',
              dependencies: ['monitoring'],
            },
          },
        ],
      },
    ],
  },
  {
    path: '/console',
    name: 'terminal',
    component: () => import('@/layouts/LayoutWithoutNavi'),
    redirect: { name: 'terminal-viewer' },
    children: [
      // terminal
      {
        path: `${prefix}/terminal/:name`,
        name: 'terminal-viewer',
        component: () => import('@/views/resource/terminal/index'),
        meta: {
          requireAuth: true,
          title: '终端',
          upToAdmin: true,
        },
      },
    ],
  },
  {
    path: '/container',
    name: 'container-log',
    component: () => import('@/layouts/LayoutWithoutNavi'),
    redirect: { name: 'container-log-viewer' },
    children: [
      // terminal
      {
        path: `${prefix}/log/:name`,
        name: 'container-log-viewer',
        component: () => import('@/views/resource/log/index'),
        meta: {
          requireAuth: true,
          title: '容器日志',
          upToAdmin: true,
        },
      },
    ],
  },
]
