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
        {{ i18n.t(smallTitle) }}
      </div>

      <div class="kubegems__clear-float" />
    </div>

    <v-spacer />

    <v-btn v-if="!store.state.GlobalPlugins['kubegems-models']" color="primary" dark depressed @click="toAppStore">
      <v-icon class="header__icon-line-height" left> mdi-shopping </v-icon>
      <span
        class="header__span-line-height"
        :style="{ fontFamily: `Yuanti SC, YouYuan, Microsoft Yahei, PingFang SC !important`, fontWeight: `bold` }"
      >
        {{ i18n.t('header.app_store') }}
      </span>
    </v-btn>

    <v-menu
      v-else
      v-model="state.menu"
      bottom
      content-class="header__bg"
      left
      nudge-bottom="5px"
      offset-y
      origin="top center"
      transition="scale-transition"
    >
      <template #activator="{ on }">
        <v-btn color="primary" dark depressed v-on="on">
          <v-icon v-if="store.state.StoreMode === 'app'" class="header__icon-line-height" left> mdi-shopping </v-icon>
          <v-icon v-else class="header__icon-line-height" left> mdi-cube </v-icon>
          <span
            class="header__span-line-height"
            :style="{ fontFamily: `Yuanti SC, YouYuan, Microsoft Yahei, PingFang SC !important;`, fontWeight: `bold` }"
          >
            {{ store.state.StoreMode === 'app' ? i18n.t('header.app_store') : i18n.t('header.model_store') }}
          </span>
          <v-icon v-if="state.menu" right>mdi-chevron-up</v-icon>
          <v-icon v-else right>mdi-chevron-down</v-icon>
        </v-btn>
      </template>
      <v-data-iterator hide-default-footer :items="[{ text: '', values: stores }]">
        <template #default="props">
          <v-card v-for="item in props.items" :key="item.text" flat>
            <v-list dense>
              <v-list-item
                v-for="(sto, index) in item.values"
                :key="index"
                class="text-body-2 text-start font-weight-medium pl-2 mx-2"
                link
                :style="{
                  color: sto.value === store.state.StoreMode ? '#1e88e5 !important' : 'rgba(0, 0, 0, 0.7) !important',
                }"
                @click="goStore(sto)"
              >
                <v-list-item-content class="text-body-2 font-weight-medium">
                  <span>
                    <v-icon
                      v-if="sto.value === 'app'"
                      :class="{ header__highlight: sto.value === store.state.StoreMode }"
                      left
                      small
                    >
                      mdi-shopping
                    </v-icon>
                    <v-icon v-else :class="{ header__highlight: sto.value === store.state.StoreMode }" left small>
                      mdi-cube
                    </v-icon>
                    {{ sto.text }}
                  </span>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </template>
      </v-data-iterator>
    </v-menu>

    <v-btn color="primary" dark depressed @click="toWorkspace">
      <v-icon class="header__icon-line-height" left> mdi-home </v-icon>
      <span
        class="header__span-line-height"
        :style="{ fontFamily: `Yuanti SC, YouYuan, Microsoft Yahei, PingFang SC !important`, fontWeight: `bold` }"
      >
        {{ i18n.t('header.workspace') }}
      </span>
    </v-btn>

    <Message />
    <User />
  </v-app-bar>
</template>

<script lang="ts" setup>
  import { nextTick, onMounted, reactive } from 'vue';

  import Message from './Message.vue';
  import User from './User.vue';
  import { useVuetify } from '@/composition/proxy';
  import { useRoute, useRouter } from '@/composition/router';
  import { LOGO_WHITE } from '@/constants/platform';
  import { useGlobalI18n } from '@/i18n';
  import { useStore } from '@/store';

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
  const router = useRouter();
  const route = useRoute();
  const vuetify = useVuetify();

  const state = reactive({
    menu: false,
  });
  const stores = [
    { text: i18n.t('header.app_store'), value: 'app' },
    { text: i18n.t('header.model_store'), value: 'model' },
  ];

  const toAppStore = (): void => {
    store.commit('CLEAR_VIRTUAL_SPACE');
    if (store.getters.Tenant().ID > 0 || store.state.Admin) {
      store.commit('SET_EDGE', '');
      router.push({ name: 'appstore-center' });
    } else {
      router.push({ name: 'whitepage' });
    }
  };

  const toModelStore = (): void => {
    store.commit('CLEAR_VIRTUAL_SPACE');
    if (store.getters.Tenant().ID > 0 || store.state.Admin) {
      store.commit('SET_EDGE', '');
      router.push({ name: 'modelstore-center' });
    } else {
      router.push({ name: 'whitepage' });
    }
  };

  const goStore = (sto: { text: string; value: string }): void => {
    if (sto) {
      store.commit('SET_STORE', sto.value);
      if (store.state.StoreMode === 'app') toAppStore();
      else toModelStore();
    }
  };

  const toWorkspace = async (): Promise<void> => {
    store.commit('CLEAR_VIRTUAL_SPACE');
    if (store.getters.Tenant().ID === 0) {
      await store.dispatch('UPDATE_TENANT_DATA');
    }
    if (store.getters.Tenant().ID > 0 || store.state.Admin) {
      store.commit('SET_ADMIN_VIEWPORT', false);
      store.commit('SET_EDGE', '');
      store.commit('CLEAR_RESOURCE');
      router.push({
        name: 'resource-dashboard',
        params: { tenant: store.getters.Tenant().TenantName },
      });
    } else {
      router.push({ name: 'whitepage' });
    }
  };

  const setSidebarDrawer = (sidebar: any): void => {
    store.commit('SET_SIDEBAR_DRAWER', sidebar);
  };

  const emit = defineEmits(['input']);

  onMounted(() => {
    nextTick(() => {
      if (['app-store', 'model-store'].indexOf(route.meta.rootName) > -1) {
        store.commit('SET_STORE', route.meta.rootName === 'app-store' ? 'app' : 'model');
      }
    });
  });
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
