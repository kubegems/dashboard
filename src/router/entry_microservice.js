export const entryMicroService = [
  {
    path: '/microservice',
    name: 'entry-microservice',
    component: () => import('@/layouts/Layout'),
    redirect: {
      name: 'virtualspace-list',
    },
    children: [
      {
        path: '',
        meta: {
          header: '微服务空间',
          title: '微服务空间',
          icon: 'mdi-cloud',
        },
        component: () => import('@/layouts/Container'),
        redirect: { name: 'virtualspace-list' },
        children: [
          // virtualspace
          {
            path: 'virtualspaces',
            name: 'virtualspace-list',
            component: () => import('@/views/microservice/virtualspace/index'),
            meta: {
              icon: 'mdi-cloud-outline',
              requireAuth: true,
              title: '虚拟空间',
              show: true,
              rootName: 'entry-microservice',
            },
          },
          // dnsdomain
          {
            path: 'dnsdomains',
            name: 'dnsdomain-list',
            component: () => import('@/views/microservice/dnsdomain/index'),
            meta: {
              icon: 'mdi-dns',
              requireAuth: true,
              title: 'DNS管理',
              show: true,
              rootName: 'entry-microservice',
            },
          },
        ],
      },
    ],
  },
]
