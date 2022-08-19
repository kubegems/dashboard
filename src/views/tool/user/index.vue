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
                  {{ User.Username }}
                  <v-chip class="mr-1 mt-n1" pill small>
                    <v-avatar left>
                      <v-btn class="white--text" color="grey lighten-4" small>
                        <BaseLogo
                          class="primary--text logo-margin mt-1"
                          :icon-name="User.SourceVendor ? User.SourceVendor.toLocaleLowerCase() : 'kubegems'"
                          :ml="0"
                          :width="20"
                        />
                      </v-btn>
                    </v-avatar>
                    <span class="font-weight-medium kubegems__text">
                      {{ $VENDOR[User.SourceVendor] || 'Selfhosted' }}
                    </span>
                  </v-chip>
                </h3>
                <h5 class="text-subtitle-2 mt-1">
                  {{ Admin ? $root.$t('role.system.administrator') : $root.$t('role.system.normal') }}
                </h5>
              </div>
            </div>
            <v-divider />
            <div class="py-5">
              <h5 class="text-subtitle-1 kubegems__text">{{ $t('table.email') }}</h5>
              <h6 class="text-body-2 mb-3">
                {{ User.Email || $root.$t('data.unknown') }}
              </h6>
              <h5 class="text-subtitle-1 kubegems__text">{{ $t('table.mobile') }}</h5>
              <h6 class="text-body-2 mb-3">
                {{ User.Phone || $root.$t('data.unknown') }}
              </h6>
              <h5 class="text-subtitle-1 kubegems__text">{{ $t('table.registe_at') }}</h5>
              <h6 class="text-body-2 mb-3">
                {{ User.CreatedAt ? $moment(User.CreatedAt).format('lll') : '' }}
              </h6>
              <h5 class="text-subtitle-1 kubegems__text">{{ $t('table.last_login_at') }}</h5>
              <h6 class="text-body-2 mb-3">
                {{ User.LastLoginAt ? $moment(User.LastLoginAt).format('lll') : '' }}
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

<script>
  import { mapState } from 'vuex';

  import AccessToken from './components/AccessToken';
  import AuditList from './components/AuditList';
  import MessageBox from './components/MessageBox';
  import OwnerSetting from './components/OwnerSetting';
  import messages from './i18n';
  import { getLoginUserInfo } from '@/api';

  export default {
    name: 'UserCenter',
    i18n: {
      messages: messages,
    },
    components: {
      AccessToken,
      AuditList,
      MessageBox,
      OwnerSetting,
    },
    data: () => ({
      tab: 0,
    }),
    computed: {
      ...mapState(['JWT', 'User', 'Admin']),
      tabItems() {
        return [
          { text: this.$t('tab.setting'), value: 'OwnerSetting' },
          { text: this.$t('tab.audit'), value: 'AuditList' },
          { text: this.$t('tab.message'), value: 'MessageBox' },
          { text: this.$t('tab.auth'), value: 'AccessToken' },
        ];
      },
    },
    mounted() {
      if (this.JWT) {
        this.loginUserInfo();
      }
    },
    methods: {
      async loginUserInfo() {
        const data = await getLoginUserInfo();
        if (data) {
          this.$store.commit('SET_USER', data);
        }
      },
    },
  };
</script>
