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
  <v-app-bar app class="header" clipped-left clipped-right color="primary" dark>
    <v-app-bar-nav-icon
      v-if="showAppBarNavIcon"
      @click="vuetify.breakpoint.smAndDown ? setSidebarDrawer(!store.state.SidebarDrawer) : emit('input', !value)"
    />

    <div>
      <div class="hidden-sm-and-down float-left">
        <v-img class="kubegems__absolute-middle" contain :src="LOGO_WHITE" width="140" />
      </div>
      <div
        class="pl-2 text-h6 float-left header__line-height"
        :style="{
          fontFamily: `Yuanti SC, YouYuan, Microsoft Yahei, PingFang SC !important`,
          fontWeight: `bold`,
          fontSize: `1.1rem !important`,
          marginLeft: `140px`,
        }"
      >
        {{ smallTitle }}
      </div>

      <div class="kubegems__clear-float" />
    </div>

    <v-spacer />

    <User />
  </v-app-bar>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useVuetify } from '@kubegems/extension/proxy';
  import { useStore } from '@kubegems/extension/store';
  import { LOGO_WHITE } from '@kubegems/libs/constants/platform';

  import User from './User.vue';

  withDefaults(
    defineProps<{
      showAppBarNavIcon?: boolean;
      smallTitle?: string;
      value?: boolean;
    }>(),
    {
      showAppBarNavIcon: true,
      smallTitle: '',
      value: false,
    },
  );

  const i18n = useGlobalI18n();
  const store = useStore();
  const vuetify = useVuetify();

  const setSidebarDrawer = (sidebar: any): void => {
    store.commit('SET_SIDEBAR_DRAWER', sidebar);
  };

  const emit = defineEmits(['input']);
</script>

<style lang="scss" scoped>
  .header {
    z-index: 9;

    &__line-height {
      line-height: 64px !important;
    }

    &__icon-line-height {
      line-height: 20px !important;
    }

    &__span-line-height {
      line-height: 22px !important;
    }

    &__bg {
      z-index: 9999 !important;
    }

    &__highlight {
      color: #1e88e5 !important;
    }
  }
</style>
