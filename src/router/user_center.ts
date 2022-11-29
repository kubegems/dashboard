import { RouteConfig } from 'vue-router';

export const userCenter: RouteConfig[] = [
  {
    path: '/user',
    name: 'user',
    component: () => import('@/layouts/LayoutWithoutNavi.vue'),
    redirect: { name: 'user-center' },
    children: [
      {
        path: 'center',
        name: 'user-center',
        component: () => import('@/views/tool/user/index.vue'),
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
