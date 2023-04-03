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
    <BaseBreadcrumb />
    <v-row class="mt-0">
      <v-col class="pt-0" cols="3">
        <v-card>
          <v-card-text class="pa-7">
            <div class="d-flex justify-center my-3">
              <div class="text-center">
                <Icon height="120px" icon="mdi:account" :style="{ color: `#1e88e5` }" width="120px" />
                <h3 class="mt-2 text-h6 font-weight-regular">
                  {{ store.state.User.Username }}
                  <v-chip class="mr-1 mt-n1" pill small>
                    <v-avatar left>
                      <v-btn class="white--text" color="grey lighten-4" small>
                        <BaseLogo
                          class="primary--text logo-margin mt-1"
                          :icon-name="
                            store.state.User.SourceVendor
                              ? store.state.User.SourceVendor.toLocaleLowerCase()
                              : 'kubegems'
                          "
                          :ml="0"
                          :width="20"
                        />
                      </v-btn>
                    </v-avatar>
                    <span class="font-weight-medium kubegems__text">
                      {{ VENDOR[store.state.User.SourceVendor] || 'Selfhosted' }}
                    </span>
                  </v-chip>
                </h3>
                <h5 class="text-subtitle-2 mt-1">
                  {{ store.state.Admin ? i18n.t('role.system.administrator') : i18n.t('role.system.normal') }}
                </h5>
              </div>
            </div>
            <v-divider />
            <div class="py-5">
              <h5 class="text-subtitle-1 kubegems__text">{{ i18nLocal.t('table.email') }}</h5>
              <h6 class="text-body-2 mb-3">
                {{ store.state.User.Email || i18n.t('data.unknown') }}
              </h6>
              <h5 class="text-subtitle-1 kubegems__text">{{ i18nLocal.t('table.mobile') }}</h5>
              <h6 class="text-body-2 mb-3">
                {{ store.state.User.Phone || i18n.t('data.unknown') }}
              </h6>
              <h5 class="text-subtitle-1 kubegems__text">{{ i18nLocal.t('table.registe_at') }}</h5>
              <h6 class="text-body-2 mb-3">
                {{ store.state.User.CreatedAt ? moment(store.state.User.CreatedAt).format('lll') : '' }}
              </h6>
              <h5 class="text-subtitle-1 kubegems__text">{{ i18nLocal.t('table.last_login_at') }}</h5>
              <h6 class="text-body-2 mb-3">
                {{ store.state.User.LastLoginAt ? moment(store.state.User.LastLoginAt).format('lll') : '' }}
              </h6>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col class="pt-0" cols="9">
        <v-card flat>
          <v-card-text class="pa-0">
            <v-tabs v-model="tab" class="rounded-t pa-3" height="30">
              <v-tab v-for="item in tabItems" :key="item.value">
                {{ item.text }}
              </v-tab>
            </v-tabs>
          </v-card-text>
        </v-card>
        <component :is="tabItems[tab].value" :ref="tabItems[tab].value" class="mt-3" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
  import { Auth } from '@kubegems/api/typed/auth';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import { VENDOR } from '@kubegems/libs/constants/platform';
  import moment from 'moment';
  import { onMounted, ref } from 'vue';

  import AccessToken from './components/AccessToken/index.vue';
  import AuditList from './components/AuditList.vue';
  import MessageBox from './components/MessageBox.vue';
  import OwnerSetting from './components/OwnerSetting.vue';
  import { useI18n } from './i18n';

  const store = useStore();
  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();

  const tab = ref<number>(0);
  const tabItems = ref([
    { text: i18nLocal.t('tab.setting'), value: OwnerSetting },
    { text: i18nLocal.t('tab.audit'), value: AuditList },
    { text: i18nLocal.t('tab.message'), value: MessageBox },
    { text: i18nLocal.t('tab.auth'), value: AccessToken },
  ]);

  const getLoginUser = async (): Promise<void> => {
    const data = await new Auth().getLoginUser();
    store.commit('SET_USER', data);
  };

  onMounted(() => {
    getLoginUser();
  });
</script>
