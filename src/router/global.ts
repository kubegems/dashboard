import { RouteConfig } from 'vue-router';

export const global: RouteConfig[] = [
  {
    path: '/',
    name: 'index',
    redirect: {
      name: 'resource-dashboard',
    },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/authentication/index.vue'),
    meta: {
      requireAuth: false,
      title: 'login',
    },
  },
  {
    path: '/oauth/callback',
    name: 'callback',
    component: () => import('@/views/authentication/callback.vue'),
    meta: { requireAuth: false },
  },
  {
    path: '/403',
    name: '403',
    component: () => import('@/layouts/LayoutWithoutNavi.vue'),
    redirect: { name: 'c403' },
    children: [
      {
        path: '',
        name: 'c403',
        component: () => import('@/views/authentication/403.vue'),
        meta: {
          requireAuth: false,
          title: '403',
        },
      },
    ],
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/layouts/LayoutWithoutNavi.vue'),
    redirect: { name: 'c404' },
    children: [
      {
        path: '',
        name: 'c404',
        component: () => import('@/views/authentication/404.vue'),
        meta: {
          requireAuth: false,
          title: '404',
        },
      },
    ],
  },
  {
    path: '/white',
    name: 'whitepage',
    component: () => import('@/layouts/LayoutWithoutNavi.vue'),
    redirect: { name: 'page' },
    children: [
      {
        path: 'page',
        name: 'page',
        component: () => import('@/views/resource/blank/white_page.vue'),
        meta: {
          requireAuth: true,
          title: 'data.no_tenant',
          smallTitle: 'header.tenant_workspace',
        },
      },
      {
        path: 'tenant',
        name: 'tenant-page',
        component: () => import('@/views/resource/blank/white_tenant_page.vue'),
        meta: {
          requireAuth: true,
          title: 'data.no_tenant',
          smallTitle: 'header.tenant_workspace',
        },
      },
    ],
  },
  {
    path: '/whitecluster',
    name: 'whiteclusterpage',
    component: () => import('@/layouts/LayoutWithoutNavi.vue'),
    redirect: { name: 'cluster-page' },
    children: [
      {
        path: 'cluster',
        name: 'cluster-page',
        component: () => import('@/views/resource/blank/white_cluster_page.vue'),
        meta: {
          requireAuth: true,
          title: 'data.no_cluster',
          smallTitle: 'header.administrator',
        },
      },
    ],
  },
];
