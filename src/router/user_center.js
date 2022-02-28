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
          smallTitle: '用户中心',
          title: '用户中心',
        },
      },
    ],
  },
]
