<!--
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
-->

<template>
  <v-container fluid>
    <v-card class="mt-8" flat height="400px">
      <v-row :style="{ height: '400px' }">
        <v-col class="d-none d-md-flex align-center justify-center">
          <div class="d-none d-sm-block">
            <div class="d-flex align-center pa-10">
              <div class="text-center">
                <h2 class="text-h4 primary--text font-weight-medium"> {{ i18nLocal.t('status.403') }} </h2>
                <h6 class="text-subtitle-1 mt-4 primary--text op-5 font-weight-regular">
                  {{ i18nLocal.t('tip.permission') }}
                </h6>
                <v-btn color="info mt-4" @click="toDashboard">
                  <v-icon left> mdi-undo-variant </v-icon>
                  {{ i18n.t('operate.return') }}
                </v-btn>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup name="v403">
  import { useI18n } from './i18n';
  import { useRouter } from '@/composition/router';
  import { useGlobalI18n } from '@/i18n';
  import { useStore } from '@/store';

  const store = useStore();
  const router = useRouter();
  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();

  const toDashboard = (): void => {
    store.commit('SET_ADMIN_VIEWPORT', false);
    router.push({
      name: 'resource-dashboard',
      params: { tenant: store.getters.Tenant().TenantName },
    });
  };
</script>
