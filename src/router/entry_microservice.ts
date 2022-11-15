import { RouteConfig } from 'vue-router';

export const entryMicroService: RouteConfig[] = [
  {
    path: '/microservice',
    name: 'entry-microservice',
    component: (): Promise<typeof import('*.vue')> => import('@/layouts/Layout.vue'),
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
        component: (): Promise<typeof import('*.vue')> => import('@/layouts/Container.vue'),
        redirect: { name: 'virtualspace-list' },
        children: [
          // virtualspace
          {
            path: 'virtualspaces',
            name: 'virtualspace-list',
            component: (): Promise<typeof import('*.vue')> => import('@/views/microservice/virtualspace/index.vue'),
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
            component: (): Promise<typeof import('*.vue')> => import('@/views/microservice/dnsdomain/index.vue'),
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
