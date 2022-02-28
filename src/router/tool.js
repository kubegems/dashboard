const prefix = ':tenant'

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
          smallTitle: '审计',
          title: '审计中心',
        },
      },
      {
        path: `${prefix}/events`,
        name: 'event-list',
        component: () => import('@/views/tool/event/index'),
        meta: {
          requireAuth: true,
          smallTitle: '事件',
          title: '事件中心',
        },
      },
    ],
  },
]
