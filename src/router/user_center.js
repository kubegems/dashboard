export const userCenter = [
  {
    path: '/user',
    name: 'user',
    component: () => import('@/layouts/LayoutWithoutNavi'),
    redirect: { name: 'user-center' },
    children: [
      {
        path: 'center',
        name: 'user-center',
        component: () => import('@/views/tool/user/index'),
        meta: {
          requireAuth: true,
          smallTitle: 'header.usercenter',
          title: 'header.usercenter',
          icon: 'mdi-account',
          tip: 'user_center',
        },
      },
    ],
  },
];
