import { RouteConfig } from 'vue-router';

export const modelStore: RouteConfig[] = [
  {
    path: '/modelstore',
    name: 'model-store',
    component: () => import('@/layouts/LayoutWithoutNavi.vue'),
    redirect: { name: 'modelstore-center' },
    children: [
      {
        path: 'models',
        name: 'modelstore-center',
        component: () => import('@/views/modelstore/index.vue'),
        meta: {
          requireAuth: true,
          smallTitle: 'header.model_store',
          title: 'header.model_store',
          icon: 'mdi-cube',
          rootName: 'model-store',
          tip: 'modelstore',
        },
      },
      {
        path: 'models/:name',
        name: 'modelstore-detail',
        component: () => import('@/views/modelstore/detail.vue'),
        meta: {
          requireAuth: true,
          smallTitle: 'header.model_store',
          title: 'header.model_store',
          icon: 'mdi-cube',
          rootName: 'model-store',
          tip: 'modelstore',
        },
      },
    ],
  },
];
