export const global = [
  {
    path: '/',
    name: 'index',
    redirect: {
      name: 'resource-dashboard',
    },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/authentication/index'),
    meta: {
      requireAuth: false,
      title: '登录',
    },
  },
  {
    path: '/oauth/callback',
    name: 'callback',
    component: () => import('@/views/authentication/callback'),
    meta: { requireAuth: false },
  },
  {
    path: '/403',
    name: '403',
    component: () => import('@/layouts/LayoutWithoutNavi'),
    redirect: { name: 'c403' },
    children: [
      {
        path: '',
        name: 'c403',
        component: () => import('@/views/authentication/403'),
        meta: {
          requireAuth: false,
          title: '无权限访问',
        },
      },
    ],
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/layouts/LayoutWithoutNavi'),
    redirect: { name: 'c404' },
    children: [
      {
        path: '',
        name: 'c404',
        component: () => import('@/views/authentication/404'),
        meta: {
          requireAuth: false,
          title: '页面不存在',
        },
      },
    ],
  },
  {
    path: '/white',
    name: 'whitepage',
    component: () => import('@/layouts/LayoutWithoutNavi'),
    redirect: { name: 'page' },
    children: [
      {
        path: 'page',
        name: 'page',
        component: () => import('@/views/resource/blank/white_page'),
        meta: {
          requireAuth: true,
          title: '暂无租户',
          smallTitle: '租户工作台',
        },
      },
      {
        path: 'tenant',
        name: 'tenant-page',
        component: () => import('@/views/resource/blank/white_tenant_page'),
        meta: {
          requireAuth: true,
          title: '暂无租户',
          smallTitle: '租户工作台',
        },
      },
    ],
  },
  {
    path: '/whitecluster',
    name: 'whiteclusterpage',
    component: () => import('@/layouts/LayoutWithoutNavi'),
    redirect: { name: 'cluster-page' },
    children: [
      {
        path: 'cluster',
        name: 'cluster-page',
        component: () => import('@/views/resource/blank/white_cluster_page'),
        meta: {
          requireAuth: true,
          title: '暂无集群',
          smallTitle: '管理员',
        },
      },
    ],
  },
];
