const prefix = ':tenant?';

export const tool = [
  {
    path: '/tool',
    name: 'tool',
    component: () => import('@/layouts/LayoutWithoutNavi'),
    redirect: { name: 'log-viewer' },
    children: [
      {
        path: `${prefix}/audits`,
        name: 'audit-list',
        component: () => import('@/views/tool/audit/index'),
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
        component: () => import('@/views/tool/event/index'),
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
