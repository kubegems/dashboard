/*
 * Copyright 2022 The kubegems.io Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { useGlobalI18n } from '@kubegems/extension/i18n';
import { useRouter } from '@kubegems/extension/router';
import { PLATFORM } from '@kubegems/libs/constants/platform';
import { platform } from '@kubegems/platform/router';
import { useStore } from '@kubegems/extension/store';

import { global } from './global';
import { observe } from './observe';

const router = useRouter();
const i18n = useGlobalI18n();
const store = useStore();

const management = [
  {
    path: '/management',
    name: 'management',
    component: () => import('@/layouts/Layout.vue'),
    redirect: { name: 'tenant-list' },
    children: platform,
  },
];

const originalRoutes = global.concat(management).concat(observe);

const rs = router.getRoutes();
originalRoutes.forEach((r) => {
  if (
    !rs.find((rr) => {
      return rr.name === r.name;
    })
  )
    router.addRoute(r);
});

router.beforeResolve((to, from, next): void => {
  if (window) {
    window.document.title = `${i18n.t(to.meta.title)} - ${PLATFORM}`;
  }
  next();
});

router.beforeEach(async (to, from, next): Promise<void> => {
  if (to.meta.requireAuth && !store.state.JWT) {
    store.commit('SET_SNACKBAR', {
      text: i18n.t('tip.need_login'),
      color: 'warning',
    });
    next({ name: 'login', query: { redirect: to.fullPath } });
    return;
  } else {
    if (to.params.tenant) {
      if (store.state.TenantStore?.length === 0 || store.state.LatestTenant?.tenant !== to.params.tenant) {
        await store.dispatch('UPDATE_TENANT_DATA');
      }
      const tenant: { [key: string]: string | number } =
        store.state.TenantStore &&
        store.state.TenantStore.find((t) => {
          return t.TenantName === to.params.tenant;
        });
      if (!tenant) {
        next({ name: '403' });
        return;
      }
      store.commit('SET_LATEST_TENANT', { tenant: tenant.TenantName });
    }
    store.dispatch('INIT_GLOBAL_PLUGINS');
    next();
  }
});

export const useRoutes = () => {
  return originalRoutes;
};

export default router;
