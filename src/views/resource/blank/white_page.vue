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
      <v-row class="row-height">
        <v-col class="d-none d-md-flex align-center justify-center">
          <div class="d-none d-sm-block">
            <div class="d-flex align-center pa-10">
              <div class="text-center">
                <h2 class="text-h4 primary--text font-weight-medium"> {{ i18nLocal.t('tip.no_tenant') }} </h2>
                <h6 class="text-subtitle-1 mt-4 primary--text op-5 font-weight-regular">
                  {{ i18nLocal.t('tip.no_tenant_tip') }}
                </h6>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
  import { nextTick, onMounted } from 'vue';

  import { useI18n } from './i18n';
  import intro from '@/extension/guide';
  import { useStore } from '@/store';

  const i18nLocal = useI18n();
  const store = useStore();

  onMounted(() => {
    nextTick(() => {
      if (store.state.Guided) {
        intro
          .setOptions({
            steps: [
              {
                intro: i18nLocal.t('intro.welcome'),
              },
              {
                element: document.querySelector('#intro_tool'),
                intro: i18nLocal.t('intro.enter'),
              },
            ],
          })
          .start();

        intro.onexit(() => {
          store.commit('SET_GUIDED', true);
        });
      }
    });
  });
</script>

<style lang="scss" scoped>
  .row-height {
    height: 400px;
  }
</style>
