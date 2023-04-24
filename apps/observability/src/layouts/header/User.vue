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
  <v-menu
    v-model="state.menu"
    bottom
    :close-on-content-click="false"
    left
    max-width="320px"
    min-width="200px"
    nudge-bottom="15px"
    offset-y
    origin="top right"
    transition="scale-transition"
    z-index="1000"
  >
    <template #activator="{ on }">
      <v-btn class="mr-1" dark icon v-on="on" @click="state.expand = false">
        <v-icon>mdi-account-circle</v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-list-item class="py-2 primary white--text" two-line>
        <v-list-item-avatar>
          <v-avatar
            class="primary--text font-weight-medium"
            color="white"
            :size="45"
            :style="{ minWidth: `40px`, width: `40px` }"
          >
            <span class="text-h5">
              {{ store.state.User.Username ? store.state.User.Username[0].toLocaleUpperCase() : 'N' }}
            </span>
          </v-avatar>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title class="text-h6 white--text kubegems__text">
            {{ store.state.User.Username }}
            <v-chip class="mr-1 primary--text mt-n1 ml-2" color="white" pill small>
              <v-avatar class="mr-0" color="white" left>
                <v-btn class="primary--text" color="white" small>
                  <BaseLogo
                    class="primary--text logo-margin mt-1"
                    :icon-name="
                      store.state.User.SourceVendor ? store.state.User.SourceVendor.toLocaleLowerCase() : 'kubegems'
                    "
                    :ml="0"
                    :width="20"
                  />
                </v-btn>
              </v-avatar>
              <span class="font-weight-medium primary--text kubegems__text">
                {{ VENDOR[store.state.User.SourceVendor] || 'Selfhosted' }}
              </span>
            </v-chip>
            <div class="kubegems__clear-float" />
          </v-list-item-title>
          <v-list-item-subtitle class="white--text">
            {{ store.state.User && store.state.User.Email ? store.state.User.Email : '' }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider class="mb-2" />
      <v-list class="pt-0 px-2">
        <v-list-item @click="showTenantSelect">
          <v-list-item-avatar height="25" min-width="25" width="25">
            <v-icon color="primary">mdi-account-multiple</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="text-body-2 font-weight-medium kubegems__text user__list__title">
              {{ i18n.t('header.user.tenant') }}
              <v-flex class="float-right white--text blue-grey lighten-2 px-1 user__item">
                {{ store.getters.Tenant().TenantName }}
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="toBook">
          <v-list-item-avatar height="25" min-width="25" width="25">
            <v-icon color="primary">mdi-book-open-variant</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="text-body-2 font-weight-medium kubegems__text user__list__title">
              {{ i18n.t('header.user.manual') }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="showAbout">
          <v-list-item-avatar height="25" min-width="25" width="25">
            <v-icon color="primary">mdi-alpha-v-circle</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="text-body-2 font-weight-medium kubegems__text user__list__title">
              {{ i18n.t('header.user.about') }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" text @click="logout">
          <v-icon left> mdi-login </v-icon>
          <span class="font-weight-medium kubegems__text">{{ i18n.t('logout') }}</span>
        </v-btn>
        <v-spacer />
      </v-card-actions>
    </v-card>

    <About ref="about" />
    <TenantSelect ref="tenantSelect" />
  </v-menu>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useRouter } from '@kubegems/extension/proxy';
  import { useStore } from '@kubegems/extension/store';
  import { VENDOR } from '@kubegems/libs/constants/platform';
  import { reactive, ref } from 'vue';

  import config from '../../config.json';
  import About from './components/About.vue';
  import TenantSelect from './components/TenantSelect.vue';

  const store = useStore();
  const router = useRouter();
  const i18n = useGlobalI18n();

  const state = reactive({
    menu: false,
    expand: false,
  });

  const logout = async (): Promise<void> => {
    store.commit('CLEARALL');
    await router.push({ name: 'login' });
  };

  const tenantSelect = ref(null);
  const showTenantSelect = (): void => {
    tenantSelect.value.init();
    tenantSelect.value.open();
    closeUserMenu();
  };

  const about = ref(null);
  const showAbout = (): void => {
    about.value.init();
    about.value.open();
    closeUserMenu();
  };

  const toBook = (): void => {
    window.open(config.layout.MANUAL);
    closeUserMenu();
  };
  const closeUserMenu = (): void => {
    state.menu = false;
    state.expand = false;
  };
</script>

<style lang="scss" scoped>
  .user {
    &__item {
      border-radius: 3px;
      min-width: 80px;
      text-align: center;
      line-height: 22px;
    }
    &__list {
      &__title {
        line-height: 22px;
      }
    }
  }
</style>
