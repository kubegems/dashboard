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
  <v-app id="kubegems" :class="`${!vuetify.breakpoint.smAndDown ? 'full-sidebar' : 'mini-sidebar'}`">
    <router-view v-if="isReloadAlive" />
    <BaseProgress :progress="config.layout.PLATFORM" />
    <BaseSnackBar />
    <BaseConfirm />
  </v-app>
</template>

<script lang="ts" setup>
  import { useVuetify } from '@kubegems/extension/proxy';
  import { useStore } from '@kubegems/extension/store';
  import { nextTick, onMounted, provide, ref } from 'vue';

  import config from './config.json';

  const store = useStore();

  const isReloadAlive = ref<boolean>(true);
  const reload = (): void => {
    isReloadAlive.value = false;
    nextTick(() => {
      isReloadAlive.value = true;
    });
  };
  provide('reload', reload);

  const vuetify = useVuetify();
  const initScale = (): void => {
    let scale = 1.0;
    if (vuetify.breakpoint.name === 'lg') {
      if (window.innerWidth > 1440 && window.innerWidth < 1920) {
        scale = 0.9;
      } else if (window.innerWidth > 1280 && window.innerWidth <= 1440) {
        scale = 0.85;
      }
    } else if (vuetify.breakpoint.name === 'xl') {
      scale = 0.95;
    }
    document.getElementsByTagName('body')[0].style.cssText = `zoom: ${scale}`;
    store.commit('SET_SCALE', scale);
  };

  onMounted(() => {
    nextTick(() => {
      initScale();
    });
  });
</script>
