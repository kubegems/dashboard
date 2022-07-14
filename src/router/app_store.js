export const appStore = [
  {
    path: '/appstore',
    name: 'app-store',
    component: () => import('@/layouts/LayoutWithoutNavi'),
    redirect: { name: 'appstore-center' },
    children: [
      {
        path: 'apps',
        name: 'appstore-center',
        component: () => import('@/views/appstore/index'),
        meta: {
          requireAuth: true,
          smallTitle: '应用商店',
          title: '应用商店',
          icon: 'mdi-shopping',
          rootName: 'app-store',
          tip: 'appstore',
        },
      },
      {
        path: 'appstores/:name',
        name: 'appstore-detail',
        component: () => import('@/views/appstore/detail'),
        meta: {
          requireAuth: true,
          smallTitle: '应用商店',
          title: '应用商店',
          icon: 'mdi-shopping',
          rootName: 'app-store',
          tip: 'appstore',
        },
      },
    ],
  },
];
