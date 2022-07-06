export const modelStore = [
  {
    path: '/modelstore',
    name: 'model-store',
    component: () => import('@/layouts/LayoutWithoutNavi'),
    redirect: { name: 'modelstore-center' },
    children: [
      {
        path: 'models',
        name: 'modelstore-center',
        component: () => import('@/views/modelstore/index'),
        meta: {
          requireAuth: true,
          smallTitle: '模型商店',
          title: '模型商店',
          icon: 'mdi-cube',
          tip: 'modelstore',
        },
      },
      {
        path: 'models/:name',
        name: 'modelstore-detail',
        component: () => import('@/views/modelstore/detail'),
        meta: {
          requireAuth: true,
          smallTitle: '模型商店',
          title: '模型商店',
          icon: 'mdi-cube',
          tip: 'modelstore',
        },
      },
    ],
  },
];
