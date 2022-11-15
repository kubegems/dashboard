import { RouteConfig } from 'vue-router';

export const userCenter: RouteConfig[] = [
  {
    path: '/user',
    name: 'user',
    component: (): Promise<typeof import('*.vue')> => import('@/layouts/LayoutWithoutNavi.vue'),
    redirect: { name: 'user-center' },
    children: [
      {
        path: 'center',
        name: 'user-center',
        component: (): Promise<typeof import('*.vue')> => import('@/views/tool/user/index.vue'),
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
