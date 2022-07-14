const prefix = 'tenants/:tenant?/projects/:project?';

export const projectWorkspace = [
  {
    path: '/',
    name: 'project',
    component: () => import('@/layouts/Layout'),
    redirect: { name: 'project-detail' },
    children: [
      {
        path: '',
        meta: {
          header: '首页',
          title: '首页',
          icon: 'mdi-view-dashboard',
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: 'project-detail' },
        children: [
          // project
          {
            path: `${prefix}/dashboard-project`,
            name: 'project-detail',
            component: () => import('@/views/resource/project/detail'),
            meta: {
              requireAuth: true,
              title: '项目资源',
              icon: 'mdi-view-dashboard',
              show: true,
              rootName: 'project',
              tip: 'project',
            },
          },
        ],
      },
      {
        path: '',
        meta: {
          header: '平台应用',
          title: '应用中心',
          icon: 'mdi-apps',
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: 'appmanifest-list' },
        children: [
          // app
          {
            path: `${prefix}/appmanifests`,
            name: 'appmanifest-list',
            component: () => import('@/views/resource/appmanifest/index'),
            meta: {
              requireAuth: true,
              title: '应用编排',
              icon: 'mdi-apps',
              show: true,
              rootName: 'project',
              tip: 'appmanifest',
            },
          },
          {
            path: `${prefix}/appmanifests/:name`,
            name: 'appmanifest-detail',
            component: () => import('@/views/resource/appmanifest/detail'),
            meta: {
              requireAuth: true,
              title: '应用编排',
              icon: 'mdi-apps',
              show: false,
              rootName: 'project',
              tip: 'appmanifest',
            },
          },
          // registry
          {
            path: `${prefix}/registrys`,
            name: 'registry-list',
            component: () => import('@/views/resource/registry/index'),
            meta: {
              requireAuth: true,
              title: '镜像仓库',
              icon: 'mdi-database',
              show: true,
              rootName: 'project',
              tip: 'registry',
            },
          },
        ],
      },
    ],
  },
];
