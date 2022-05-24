const prefix = 'virtualspaces/:virtualspace?'

export const microService = [
  {
    path: '/microservice',
    name: 'microservice',
    component: () => import('@/layouts/Layout'),
    redirect: {
      name: 'virtualspace-list',
    },
    children: [
      {
        path: '',
        meta: {
          header: '微服务空间',
          title: '虚拟空间',
          icon: 'mdi-cloud',
          dependencies: ['istio'],
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: 'virtualspace-detail' },
        children: [
          {
            path: `${prefix}/dashboard-virtualspace`,
            name: 'virtualspace-detail',
            component: () => import('@/views/microservice/virtualspace/detail'),
            meta: {
              requireAuth: true,
              title: '虚拟空间资源',
              icon: 'mdi-cloud-outline',
              show: true,
              rootName: 'microservice',
              dependencies: ['istio'],
              tip: 'v-dashboard',
            },
          },
        ],
      },
      {
        path: '',
        meta: {
          header: '微服务治理',
          title: '应用',
          icon: 'mdi-application',
          dependencies: ['istio'],
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: 'microapp-graph' },
        children: [
          // microapp
          {
            path: `${prefix}/graph`,
            name: 'microapp-graph',
            component: () => import('@/views/microservice/app/index'),
            meta: {
              requireAuth: true,
              title: '服务调用图',
              icon: 'mdi-vector-polyline',
              show: true,
              rootName: 'microservice',
              dependencies: ['istio', 'observability'],
              tip: 'dag',
            },
          },
          // microworkload
          {
            path: `${prefix}/workloads`,
            name: 'microworkload-list',
            component: () => import('@/views/microservice/workload/index'),
            meta: {
              requireAuth: true,
              title: '工作负载',
              icon: 'mdi-vector-arrange-above',
              show: true,
              rootName: 'microservice',
              dependencies: ['istio'],
              tip: 'v-workload',
            },
          },
          {
            path: `${prefix}/workloads/:name`,
            name: 'microworkload-detail',
            component: () => import('@/views/microservice/workload/detail'),
            meta: {
              requireAuth: true,
              title: '工作负载',
              icon: 'mdi-vector-arrange-above',
              show: false,
              rootName: 'microservice',
              dependencies: ['istio', 'observability'],
              tip: 'v-workload',
            },
          },
          // service
          {
            path: `${prefix}/services`,
            name: 'microservice-list',
            component: () => import('@/views/microservice/service/index'),
            meta: {
              requireAuth: true,
              title: '服务',
              icon: 'mdi-network',
              show: true,
              rootName: 'microservice',
              dependencies: ['istio'],
              tip: 'v-service',
            },
          },
          {
            path: `${prefix}/services/:name`,
            name: 'microservice-detail',
            component: () => import('@/views/microservice/service/detail'),
            meta: {
              requireAuth: true,
              title: '服务',
              icon: 'mdi-network',
              show: false,
              rootName: 'microservice',
              dependencies: ['istio', 'observability'],
              tip: 'v-service',
            },
          },
        ],
      },
      {
        path: '',
        meta: {
          title: '配置',
          icon: 'mdi-brightness-7',
          dependencies: ['istio'],
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: 'microconfigmap-list' },
        children: [
          // configmap
          {
            path: `${prefix}/configmaps`,
            name: 'microconfigmap-list',
            component: () => import('@/views/microservice/configmap/index'),
            meta: {
              requireAuth: true,
              title: 'Kubernetes配置',
              icon: 'mdi-wrench',
              show: true,
              rootName: 'microservice',
              dependencies: ['istio'],
              tip: 'v-configmap',
            },
          },
          {
            path: `${prefix}/configmaps/:name`,
            name: 'microconfigmap-detail',
            component: () => import('@/views/resource/configmap/detail'),
            meta: {
              requireAuth: true,
              title: 'Kubernetes配置',
              icon: 'mdi-wrench',
              show: false,
              rootName: 'microservice',
              dependencies: ['istio'],
              tip: 'v-configmap',
            },
          },
        ],
      },
      {
        path: '',
        meta: {
          title: '空间配置',
          icon: 'mdi-home-variant',
          dependencies: ['istio'],
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: 'istiogateway-list' },
        children: [
          // gateway
          {
            path: `${prefix}/istiogateways`,
            name: 'istiogateway-list',
            component: () => import('@/views/microservice/istio_gateway/index'),
            meta: {
              requireAuth: true,
              title: '微服务网关实例',
              icon: 'mdi-gate',
              show: true,
              rootName: 'microservice',
              dependencies: ['istio'],
              tip: 'v-gateway-instance',
            },
          },
          {
            path: `${prefix}/istiogateways/:name`,
            name: 'istiogateway-detail',
            component: () => import('@/views/microservice/istio_gateway/detail'),
            meta: {
              requireAuth: true,
              title: '微服务网关实例',
              icon: 'mdi-gate',
              show: false,
              rootName: 'microservice',
              dependencies: ['istio'],
              tip: 'v-gateway-instance',
            },
          },
        ],
      },
      {
        path: '',
        meta: {
          title: 'Istio配置',
          icon: 'mdi-access-point-network',
          dependencies: ['istio'],
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: 'authorizationpolicy-list' },
        children: [
          // authorizationpolicy
          {
            path: `${prefix}/authorizationpolicys`,
            name: 'authorizationpolicy-list',
            component: () =>
              import('@/views/microservice/istio/authorization_policy/index'),
            meta: {
              requireAuth: true,
              title: '认证策略',
              icon: 'mdi-key',
              show: true,
              rootName: 'microservice',
              dependencies: ['istio'],
              tip: 'v-authorization-policy',
            },
          },
          // gateways
          {
            path: `${prefix}/gateways`,
            name: 'gateway-list',
            component: () => import('@/views/microservice/istio/gateway/index'),
            meta: {
              requireAuth: true,
              title: '网关',
              icon: 'mdi-network',
              show: true,
              rootName: 'microservice',
              dependencies: ['istio'],
              tip: 'v-gateway',
            },
          },
          // peerauthentication
          {
            path: `${prefix}/peerauthentications`,
            name: 'peerauthentication-list',
            component: () =>
              import('@/views/microservice/istio/peer_authentication/index'),
            meta: {
              requireAuth: true,
              title: '端点认证',
              icon: 'mdi-vector-point',
              show: true,
              rootName: 'microservice',
              dependencies: ['istio'],
              tip: 'v-peer-authentication',
            },
          },
          // serviceentry
          {
            path: `${prefix}/serviceentrys`,
            name: 'serviceentry-list',
            component: () => import('@/views/microservice/istio/service_entry/index'),
            meta: {
              requireAuth: true,
              title: '服务入口',
              icon: 'mdi-login-variant',
              show: true,
              rootName: 'microservice',
              dependencies: ['istio'],
              tip: 'v-service-entry',
            },
          },
          // sidecar
          {
            path: `${prefix}/sidecars`,
            name: 'sidecar-list',
            component: () => import('@/views/microservice/istio/sidecar/index'),
            meta: {
              requireAuth: true,
              title: '边车',
              icon: 'mdi-motorbike',
              show: true,
              rootName: 'microservice',
              dependencies: ['istio'],
              tip: 'v-sidecar',
            },
          },
        ],
      },
    ],
  },
]
