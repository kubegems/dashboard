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
  <div class="pass">
    <template v-if="!pluginPass">
      <div class="container container--fluid">
        <BaseBreadcrumb />
      </div>
      <v-card class="mx-3" flat :height="`${height}px`">
        <v-row :style="{ height: `${height}px` }">
          <v-col class="d-flex align-center justify-center">
            <div class="d-flex align-center pa-10">
              <div class="text-center">
                <h2 class="text-h5 primary--text font-weight-medium">
                  {{ i18n.t('plugin.missing', [noPermisionPlugins.join(', ')]) }}
                </h2>
                <h6 class="text-subtitle-1 mt-4 primary--text op-5 font-weight-regular">
                  {{ i18n.t('plugin.no_permission') }}
                </h6>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </template>
    <slot v-else />
  </div>
</template>

<script lang="ts" setup>
  import { computed, ComputedRef, ref } from 'vue';

  import { useStore } from '@/store';
  import { useRoute } from '@/composition/router';
  import { useGlobalI18n } from '@/i18n';

  const store = useStore();
  const route = useRoute();
  const i18n = useGlobalI18n();

  const noPermisionPlugins = ref([]);
  const pluginPass: ComputedRef<boolean> = computed(() => {
    let pass: boolean = true;
    noPermisionPlugins.value = [];
    if (route.meta.innerCheck) return pass;
    const dependencies = route.meta.dependencies;
    if (dependencies === undefined) return pass;
    dependencies.forEach((d) => {
      if (!store.state.Plugins[d]) {
        noPermisionPlugins.value.push(d);
        pass = false;
        return;
      }
    });
    return pass;
  });
  const height: ComputedRef<number> = computed(() => {
    return parseInt(((window.innerHeight - 128) / (store.state.Scale as number)).toString()) - 24;
  });
</script>

<style lang="scss" scoped>
  .pass {
    position: relative;
  }
</style>
