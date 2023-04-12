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

const prefix = 'virtualspaces/:virtualspace?';

export const entryMicroService: RouteConfig[] = [
  {
    path: '',
    meta: {
      header: 'routerbar.microservice.h_space',
      title: 'routerbar.microservice.g_space',
      icon: 'mdi-cloud',
    },
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: 'virtualspace-list' },
    children: [
      // virtualspace
      {
        path: 'virtualspaces',
        name: 'virtualspace-list',
        component: () => import('./src/views/microservice/virtualspace/index.vue'),
        meta: {
          icon: 'mdi-cloud-outline',
          requireAuth: true,
          title: 'routerbar.microservice.virtualspace',
          show: true,
          rootName: 'entry-microservice',
          tip: 'virtualspace',
        },
      },
      // dnsdomain
      {
        path: 'dnsdomains',
        name: 'dnsdomain-list',
        component: () => import('./src/views/microservice/dnsdomain/index.vue'),
        meta: {
          icon: 'mdi-dns',
          requireAuth: true,
          title: 'routerbar.microservice.dns',
          show: true,
          rootName: 'entry-microservice',
          tip: 'dns',
        },
      },
    ],
  },
];

export const microService: RouteConfig[] = [
  {
    path: '',
    meta: {
      header: 'routerbar.microservice.h_space',
      title: 'routerbar.microservice.g_virtualspace',
      icon: 'mdi-cloud',
      dependencies: ['istio'],
    },
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: 'virtualspace-detail' },
    children: [
      {
        path: `${prefix}/dashboard-virtualspace`,
        name: 'virtualspace-detail',
        component: () => import('./src/views/microservice/virtualspace/detail.vue'),
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
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: 'microapp-graph' },
    children: [
      // microapp
      {
        path: `${prefix}/graph`,
        name: 'microapp-graph',
        component: () => import('./src/views/microservice/app/index.vue'),
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
        component: () => import('./src/views/microservice/workload/index.vue'),
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
        component: () => import('./src/views/microservice/workload/detail.vue'),
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
        component: () => import('./src/views/microservice/service/index.vue'),
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
        component: () => import('./src/views/microservice/service/detail.vue'),
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
      title: 'routerbar.microservice.g_spaceconfig',
      icon: 'mdi-home-variant',
      dependencies: ['istio'],
    },
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: 'istiogateway-list' },
    children: [
      // gateway
      {
        path: `${prefix}/istiogateways`,
        name: 'istiogateway-list',
        component: () => import('./src/views/microservice/istio_gateway/index.vue'),
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
        component: () => import('./src/views/microservice/istio_gateway/detail.vue'),
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
    component: () => import('@kubegems/components/layouts/Container.vue'),
    redirect: { name: 'authorizationpolicy-list' },
    children: [
      // authorizationpolicy
      {
        path: `${prefix}/authorizationpolicys`,
        name: 'authorizationpolicy-list',
        component: () => import('./src/views/microservice/istio/authorization_policy/index.vue'),
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
        component: () => import('./src/views/microservice/istio/gateway/index.vue'),
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
        component: () => import('./src/views/microservice/istio/peer_authentication/index.vue'),
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
        component: () => import('./src/views/microservice/istio/service_entry/index.vue'),
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
        component: () => import('./src/views/microservice/istio/sidecar/index.vue'),
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
];
