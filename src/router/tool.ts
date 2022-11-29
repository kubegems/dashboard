import { RouteConfig } from 'vue-router';

const prefix = ':tenant?';

export const tool: RouteConfig[] = [
  {
    path: '/tool',
    name: 'tool',
    component: () => import('@/layouts/LayoutWithoutNavi.vue'),
    redirect: { name: 'log-viewer' },
    children: [
      {
        path: `${prefix}/audits`,
        name: 'audit-list',
        component: () => import('@/views/tool/audit/index.vue'),
        meta: {
          requireAuth: true,
          smallTitle: 'header.audit',
          title: 'header.audit',
          icon: 'mdi-history',
          tip: 'audit',
        },
      },
      {
        path: `${prefix}/events`,
        name: 'event-list',
        component: () => import('@/views/tool/event/index.vue'),
        meta: {
          requireAuth: true,
          smallTitle: 'header.event',
          title: 'header.event',
          icon: 'mdi-bell',
          dependencies: ['logging', 'eventer'],
          tip: 'event',
          innerCheck: true,
        },
      },
    ],
  },
];
