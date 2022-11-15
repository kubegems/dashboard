import { RouteConfig } from 'vue-router';

const prefix = 'virtualspaces/:virtualspace?';

export const microService: RouteConfig[] = [
  {
    path: '/microservice',
    name: 'microservice',
    component: (): Promise<typeof import('*.vue')> => import('@/layouts/Layout.vue'),
    redirect: {
      name: 'virtualspace-list',
    },
    children: [
      {
        path: '',
        meta: {
          header: 'routerbar.microservice.h_space',
          title: 'routerbar.microservice.g_virtualspace',
          icon: 'mdi-cloud',
          dependencies: ['istio'],
        },
        component: (): Promise<typeof import('*.vue')> => import('@/layouts/Container.vue'),
        redirect: { name: 'virtualspace-detail' },
        children: [
          {
            path: `${prefix}/dashboard-virtualspace`,
            name: 'virtualspace-detail',
            component: (): Promise<typeof import('*.vue')> => import('@/views/microservice/virtualspace/detail.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.microservice.dashboard',
              icon: 'mdi-cloud-outline',
              show: true,
              rootName: 'microservice',
              dependencies: ['istio'],
              tip: 'v_dashboard',
              innerCheck: true,
            },
          },
        ],
      },
      {
        path: '',
        meta: {
          header: 'routerbar.microservice.h_mesh',
          title: 'routerbar.microservice.g_app',
          icon: 'mdi-application',
          dependencies: ['istio'],
        },
        component: (): Promise<typeof import('*.vue')> => import('@/layouts/Container.vue'),
        redirect: { name: 'microapp-graph' },
        children: [
          // microapp
          {
            path: `${prefix}/graph`,
            name: 'microapp-graph',
            component: (): Promise<typeof import('*.vue')> => import('@/views/microservice/app/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.microservice.mesh',
              icon: 'mdi-vector-polyline',
              show: true,
              rootName: 'microservice',
              dependencies: ['istio'],
              tip: 'mesh_dag',
              innerCheck: true,
            },
          },
          // microworkload
          {
            path: `${prefix}/workloads`,
            name: 'microworkload-list',
            component: (): Promise<typeof import('*.vue')> => import('@/views/microservice/workload/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.microservice.workload',
              icon: 'mdi-vector-arrange-above',
              show: true,
              rootName: 'microservice',
              dependencies: ['istio'],
              tip: 'v_workload',
              innerCheck: true,
            },
          },
          {
            path: `${prefix}/workloads/:name`,
            name: 'microworkload-detail',
            component: (): Promise<typeof import('*.vue')> => import('@/views/microservice/workload/detail.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.microservice.workload',
              icon: 'mdi-vector-arrange-above',
              show: false,
              rootName: 'microservice',
              dependencies: ['istio'],
              tip: 'v_workload',
              innerCheck: true,
            },
          },
          // service
          {
            path: `${prefix}/services`,
            name: 'microservice-list',
            component: (): Promise<typeof import('*.vue')> => import('@/views/microservice/service/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.microservice.service',
              icon: 'mdi-network',
              show: true,
              rootName: 'microservice',
              dependencies: ['istio'],
              tip: 'v_service',
              innerCheck: true,
            },
          },
          {
            path: `${prefix}/services/:name`,
            name: 'microservice-detail',
            component: (): Promise<typeof import('*.vue')> => import('@/views/microservice/service/detail.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.microservice.service',
              icon: 'mdi-network',
              show: false,
              rootName: 'microservice',
              dependencies: ['istio'],
              tip: 'v_service',
              innerCheck: true,
            },
          },
        ],
      },
      {
        path: '',
        meta: {
          title: 'routerbar.microservice.g_config',
          icon: 'mdi-brightness-7',
          dependencies: ['istio'],
        },
        component: (): Promise<typeof import('*.vue')> => import('@/layouts/Container.vue'),
        redirect: { name: 'microconfigmap-list' },
        children: [
          // configmap
          {
            path: `${prefix}/configmaps`,
            name: 'microconfigmap-list',
            component: (): Promise<typeof import('*.vue')> => import('@/views/microservice/configmap/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.microservice.configmap',
              icon: 'mdi-wrench',
              show: true,
              rootName: 'microservice',
              dependencies: ['istio'],
              tip: 'v_configmap',
              innerCheck: true,
            },
          },
          {
            path: `${prefix}/configmaps/:name`,
            name: 'microconfigmap-detail',
            component: (): Promise<typeof import('*.vue')> => import('@/views/resource/configmap/detail.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.microservice.configmap',
              icon: 'mdi-wrench',
              show: false,
              rootName: 'microservice',
              dependencies: ['istio'],
              tip: 'v_configmap',
              innerCheck: true,
            },
          },
        ],
      },
      {
        path: '',
        meta: {
          title: 'routerbar.microservice.g_spaceconfig',
          icon: 'mdi-home-variant',
          dependencies: ['istio'],
        },
        component: (): Promise<typeof import('*.vue')> => import('@/layouts/Container.vue'),
        redirect: { name: 'istiogateway-list' },
        children: [
          // gateway
          {
            path: `${prefix}/istiogateways`,
            name: 'istiogateway-list',
            component: (): Promise<typeof import('*.vue')> => import('@/views/microservice/istio_gateway/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.microservice.gateway_intance',
              icon: 'mdi-gate',
              show: true,
              rootName: 'microservice',
              dependencies: ['istio'],
              tip: 'v_gateway_instance',
              innerCheck: true,
            },
          },
          {
            path: `${prefix}/istiogateways/:name`,
            name: 'istiogateway-detail',
            component: (): Promise<typeof import('*.vue')> => import('@/views/microservice/istio_gateway/detail.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.microservice.gateway_intance',
              icon: 'mdi-gate',
              show: false,
              rootName: 'microservice',
              dependencies: ['istio'],
              tip: 'v_gateway_instance',
              innerCheck: true,
            },
          },
        ],
      },
      {
        path: '',
        meta: {
          title: 'routerbar.microservice.g_istioconfig',
          icon: 'mdi-access-point-network',
          dependencies: ['istio'],
        },
        component: (): Promise<typeof import('*.vue')> => import('@/layouts/Container.vue'),
        redirect: { name: 'authorizationpolicy-list' },
        children: [
          // authorizationpolicy
          {
            path: `${prefix}/authorizationpolicys`,
            name: 'authorizationpolicy-list',
            component: (): Promise<typeof import('*.vue')> =>
              import('@/views/microservice/istio/authorization_policy/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.microservice.authorization_policy',
              icon: 'mdi-key',
              show: true,
              rootName: 'microservice',
              dependencies: ['istio'],
              tip: 'v_authorization_policy',
              innerCheck: true,
            },
          },
          // gateways
          {
            path: `${prefix}/gateways`,
            name: 'gateway-list',
            component: (): Promise<typeof import('*.vue')> => import('@/views/microservice/istio/gateway/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.microservice.gateway',
              icon: 'mdi-network',
              show: true,
              rootName: 'microservice',
              dependencies: ['istio'],
              tip: 'v_gateway',
              innerCheck: true,
            },
          },
          // peerauthentication
          {
            path: `${prefix}/peerauthentications`,
            name: 'peerauthentication-list',
            component: (): Promise<typeof import('*.vue')> =>
              import('@/views/microservice/istio/peer_authentication/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.microservice.peer_authentication',
              icon: 'mdi-vector-point',
              show: true,
              rootName: 'microservice',
              dependencies: ['istio'],
              tip: 'v_peer_authentication',
              innerCheck: true,
            },
          },
          // serviceentry
          {
            path: `${prefix}/serviceentrys`,
            name: 'serviceentry-list',
            component: (): Promise<typeof import('*.vue')> =>
              import('@/views/microservice/istio/service_entry/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.microservice.service_entry',
              icon: 'mdi-login-variant',
              show: true,
              rootName: 'microservice',
              dependencies: ['istio'],
              tip: 'v_service_entry',
              innerCheck: true,
            },
          },
          // sidecar
          {
            path: `${prefix}/sidecars`,
            name: 'sidecar-list',
            component: (): Promise<typeof import('*.vue')> => import('@/views/microservice/istio/sidecar/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.microservice.sidecar',
              icon: 'mdi-motorbike',
              show: true,
              rootName: 'microservice',
              dependencies: ['istio'],
              tip: 'v_sidecar',
              innerCheck: true,
            },
          },
        ],
      },
    ],
  },
];
