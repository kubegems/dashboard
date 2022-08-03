const prefix = 'tenants/:tenant?';

export const dashboard = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/layouts/Layout'),
    redirect: { name: 'resource-dashboard' },
    children: [
      {
        path: '',
        meta: {
          header: 'routerbar.cluster.h_dashboard',
          title: 'routerbar.cluster.g_dashboard',
          icon: 'mdi-view-dashboard',
          required: ['tenant'],
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: 'resource-dashboard' },
        children: [
          // dashboard
          {
            path: `${prefix}/dashboard-tenant`,
            name: 'resource-dashboard',
            component: () => import('@/views/resource/dashboard/index'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.environment_dashboaed',
              icon: 'mdi-view-dashboard',
              show: true,
              rootName: 'dashboard',
              tip: 'dashboard',
            },
          },
        ],
      },
      {
        path: '',
        meta: {
          header: 'routerbar.cluster.h_space',
          title: 'routerbar.cluster.g_space',
          icon: 'mdi-view-grid',
          required: ['tenant'],
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: 'appmanifest-list' },
        children: [
          // project
          {
            path: `${prefix}/projects`,
            name: 'project-list',
            component: () => import('@/views/resource/project/index'),
            meta: {
              requireAuth: true,
              title: 'routerbar.cluster.project',
              icon: 'mdi-view-dashboard',
              show: true,
              rootName: 'dashboard',
              tip: 'project',
            },
          },
        ],
      },
    ],
  },
];
