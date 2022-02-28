const prefix = 'tenants/:tenant'

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
          header: '首页',
          title: '首页',
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
              title: '租户资源',
              icon: 'mdi-view-dashboard',
              show: true,
              rootName: 'dashboard',
            },
          },
        ],
      },
      {
        path: '',
        meta: {
          header: '空间',
          title: '空间管理',
          icon: 'mdi-apps',
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
              title: '项目',
              icon: 'mdi-cube-outline',
              show: true,
              rootName: 'dashboard',
            },
          },
        ],
      },
    ],
  },
]
