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
  <v-app id="opengems" :class="`${!vuetify.breakpoint.smAndDown ? 'full-sidebar' : 'mini-sidebar'}`">
    <router-view v-if="isReloadAlive" />
    <BaseProgress :progress="config.layout.PLATFORM" />
    <BaseSnackBar />
    <BaseConfirm />
  </v-app>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useMeta, useRouter, useVuetify } from '@kubegems/extension/proxy';
  import { useStore } from '@kubegems/extension/store';
  import config from '@kubegems/libs/constants/global';
  import { nextTick, onMounted, provide, ref } from 'vue';

  const store = useStore();
  const i18n = useGlobalI18n();
  const router = useRouter();

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
        scale = 0.86;
      } else if (window.innerWidth > 1280 && window.innerWidth <= 1440) {
        scale = 0.8;
      }
    } else if (vuetify.breakpoint.name === 'xl') {
      scale = 0.92;
    }
    document.getElementsByTagName('body')[0].style.cssText = `zoom: ${scale}`;
    store.commit('SET_SCALE', scale);
  };

  const latestVersion: string = (import.meta as any).env.VUE_APP_RELEASE;
  const clearLocalStorage = async (): Promise<void> => {
    if (store.state.Version && store.state.Version !== latestVersion) {
      store.commit('CLEARALL');
      await router.push({ name: 'login' });
      store.commit('SET_SNACKBAR', {
        text: i18n.t('tip.version', [latestVersion]),
        color: 'warning',
      });
      if (latestVersion) store.commit('SET_VERSION', latestVersion);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const meta = useMeta();
  const setMeta = (): void => {
    const { set } = meta.addApp('custom');
    set({
      meta: [
        { keyWords: `gitops,kubegems,kubernetes,Cloud Native`, property: '', content: '' },
        { description: i18n.t('metadata.description'), property: '', content: '' },
      ],
    });
  };

  onMounted(() => {
    nextTick(() => {
      // 初始化缩放
      initScale();
      // 版本迭代清理本地缓存
      clearLocalStorage();
      // 设置meta
      setMeta();
    });
  });
</script>
