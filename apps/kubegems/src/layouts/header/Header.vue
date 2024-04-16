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
      <div v-if="config.layout.LOGO_WHITE" class="hidden-sm-and-down float-left">
        <v-img class="kubegems__absolute-middle" contain :src="config.layout.LOGO_WHITE" width="45" />
      </div>
      <div
        class="pl-2 text-h6 float-left header__line-height"
        :style="{
          fontFamily: `kubegems-sample !important`,
          fontSize: `1.5rem !important`,
          marginLeft: config.layout.LOGO_WHITE ? `45px` : 0,
        }"
      >
        {{ module.title }}
      </div>

      <div class="kubegems__clear-float" />
    </div>

    <v-btn class="ml-4" color="primary" dark depressed @click="toHome">
      <v-icon class="header__icon-line-height" left> mdi-home </v-icon>
      <span
        class="header__span-line-height"
        :style="{ fontFamily: `Yuanti SC, YouYuan, Microsoft Yahei, PingFang SC !important`, fontWeight: `bold` }"
      >
        {{ i18n.t('header.home') }}
      </span>
    </v-btn>

    <v-spacer />

    <template v-if="module.title === 'KubeGems' || module.title === 'KubeGems Admin'">
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
              :style="{
                fontFamily: `Yuanti SC, YouYuan, Microsoft Yahei, PingFang SC !important;`,
                fontWeight: `bold`,
              }"
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
                    color:
                      sto.value === store.state.StoreMode
                        ? 'var(--primary-color) !important'
                        : 'rgba(0, 0, 0, 0.7) !important',
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
    </template>

    <v-btn v-if="hasWorkspace" color="primary" dark depressed @click="toWorkspace">
      <v-icon class="header__icon-line-height" left> mdi-monitor </v-icon>
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
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useRoute, useRouter, useVuetify } from '@kubegems/extension/proxy';
  import { useMeta } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import config from '@kubegems/libs/constants/global';
  import { computed, nextTick, onMounted, reactive } from 'vue';

  import Message from './Message.vue';
  import User from './User.vue';

  withDefaults(
    defineProps<{
      showAppBarNavIcon?: boolean;
      value?: boolean;
    }>(),
    {
      showAppBarNavIcon: true,
      value: false,
    },
  );

  const i18n = useGlobalI18n();
  const store = useStore();
  const router = useRouter();
  const route = useRoute();
  const vuetify = useVuetify();
  const meta = useMeta();

  const hasWorkspace = computed(() => {
    return (
      ['app-store', 'model-store', 'admin-workspace', 'admin-observe', 'admin-modelhub'].indexOf(meta.value.rootName) >
      -1
    );
  });

  const module = computed(() => {
    if (['dashboard', 'workspace', 'project'].indexOf(meta.value.rootName) > -1) {
      return { title: config.product.KUBEGEMS, logo: '/logo/KubeGems-white.svg' };
    } else if (['app-store', 'model-store'].indexOf(meta.value.rootName) > -1) {
      return { title: config.product.KUBEGEMS + ' ' + i18n.t(meta.value.smallTitle), logo: '/logo/KubeGems-white.svg' };
    } else if (['admin-workspace'].indexOf(meta.value.rootName) > -1) {
      return { title: config.product.KUBEGEMS + ' ' + 'Admin', logo: '/logo/KubeGems-white.svg' };
    } else if (['observe'].indexOf(meta.value.rootName) > -1) {
      return { title: config.product.OBSERVEGEMS, logo: '/logo/ObserGems-white.svg' };
    } else if (['admin-observe'].indexOf(meta.value.rootName) > -1) {
      return { title: config.product.OBSERVEGEMS + ' ' + 'Admin', logo: '/logo/ObserGems-white.svg' };
    } else if (['admin-modelhub'].indexOf(meta.value.rootName) > -1) {
      return { title: config.product.MODELHUB + ' ' + 'Admin', logo: '/logo/GemsHub-white.svg' };
    } else if (['modelhub'].indexOf(meta.value.rootName) > -1) {
      return { title: config.product.MODELHUB, logo: '/logo/GemsHub-white.svg' };
    } else {
      return { title: 'Admin', logo: '/logo/OpenGems-white.svg' };
    }
  });

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
    if (module.value.title.indexOf(config.product.KUBEGEMS) > -1) {
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
    } else if (module.value.title.indexOf(config.product.OBSERVEGEMS) > -1) {
      store.commit('SET_ADMIN_VIEWPORT', false);
      router.push({
        name: 'observe',
        params: { tenant: store.getters.Tenant().TenantName },
      });
    }
  };

  const toHome = () => {
    store.commit('SET_EDGE', '');
    router.push({ name: 'home' });
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
      color: var(--primary-color) !important;
    }

    &__home {
      margin-left: 180px;
    }
  }
</style>
