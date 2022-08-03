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
          header: 'routerbar.microservice.h_space',
          title: 'routerbar.microservice.g_space',
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
              title: 'routerbar.microservice.virtualspace',
              show: true,
              rootName: 'entry-microservice',
              tip: 'virtualspace',
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
              title: 'routerbar.microservice.dns',
              show: true,
              rootName: 'entry-microservice',
              tip: 'dns',
            },
          },
        ],
      },
    ],
  },
];
