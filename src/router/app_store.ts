import { RouteConfig } from 'vue-router';

export const appStore: RouteConfig[] = [
  {
    path: '/appstore',
    name: 'app-store',
    component: (): Promise<typeof import('*.vue')> => import('@/layouts/LayoutWithoutNavi.vue'),
    redirect: { name: 'appstore-center' },
    children: [
      {
        path: 'apps',
        name: 'appstore-center',
        component: (): Promise<typeof import('*.vue')> => import('@/views/appstore/index.vue'),
        meta: {
          requireAuth: true,
          smallTitle: 'header.app_store',
          title: 'header.app_store',
          icon: 'mdi-shopping',
          rootName: 'app-store',
          tip: 'appstore',
        },
      },
      {
        path: 'appstores/:name',
        name: 'appstore-detail',
        component: (): Promise<typeof import('*.vue')> => import('@/views/appstore/detail.vue'),
        meta: {
          requireAuth: true,
          smallTitle: 'header.app_store',
          title: 'header.app_store',
          icon: 'mdi-shopping',
          rootName: 'app-store',
          tip: 'appstore',
        },
      },
    ],
  },
];
