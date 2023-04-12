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
import { useStore } from '@kubegems/extension/store';
import { PLATFORM } from '@kubegems/libs/constants/platform';
import { platform } from '@kubegems/platform/router';

import { entryMicroService } from './entry_microservice';
import { global } from './global';
import { microService } from './microservice';

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

const originalRoutes = global.concat(management).concat(entryMicroService).concat(microService);

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
    if (to.params.virtualspace && store.state.VirtualSpaceStore.length === 0) {
      await store.dispatch('UPDATE_VIRTUALSPACE_DATA');
    }
    store.dispatch('INIT_GLOBAL_PLUGINS');
    next();
  }
});

export const useRoutes = () => {
  return originalRoutes;
};

export default router;
