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
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <v-menu left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="updateTenant"> {{ $root.$t('operate.edit') }} </v-btn>
                </v-flex>
                <template v-if="tenant">
                  <v-flex v-if="tenant.IsActive">
                    <v-btn color="error" small text @click="forbidTenant"> {{ $t('operate.disable') }} </v-btn>
                  </v-flex>
                  <v-flex v-else>
                    <v-btn color="primary" small text @click="activeTenant"> {{ $t('operate.enable') }} </v-btn>
                  </v-flex>
                </template>
                <v-flex>
                  <v-btn color="error" small text @click="removeTenant"> {{ $root.$t('operate.delete') }} </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-0">
      <v-col class="pt-0" cols="2">
        <v-card>
          <v-card-title class="text-h6 primary--text">
            {{ tenant ? tenant.TenantName : '' }}
          </v-card-title>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__text">
              <v-list-item-title class="text-subtitle-2"> {{ $t('table.status') }} </v-list-item-title>
              <v-list-item-subtitle>
                <span v-if="tenant ? tenant.IsActive : false">
                  <v-icon color="primary" small> mdi-check-circle </v-icon>
                  {{ $t('status.enabled') }}
                </span>
                <span v-else>
                  <v-icon color="error" small> mdi-minus-circle </v-icon>
                  {{ $t('status.disabled') }}
                </span>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__text">
              <v-list-item-title class="text-subtitle-2"> {{ $t('table.create_at') }} </v-list-item-title>
              <v-list-item-subtitle>
                {{ tenant && tenant.CreatedAt ? $moment(tenant.CreatedAt).format('lll') : '' }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-card>
      </v-col>
      <v-col class="pt-0" cols="10">
        <UserList :tenant="tenant" />

        <ResourceList class="mt-3" :tenant="tenant" />
      </v-col>
    </v-row>

    <UpdateTenant ref="updateTenant" @refresh="tenantDetail" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import ResourceList from './components/ResourceList';
  import UpdateTenant from './components/UpdateTenant';
  import UserList from './components/UserList';
  import messages from './i18n';
  import { deleteTenant, getTenantDetail, putActiveTenant, putForbideTenant } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'TenantDetail',
    i18n: {
      messages: messages,
    },
    components: {
      ResourceList,
      UserList,
      UpdateTenant,
    },
    mixins: [BaseFilter, BaseSelect],
    data: () => ({
      tenant: null,
      tenantId: 0,
    }),
    computed: {
      ...mapState(['JWT']),
      ...mapGetters(['Tenant']),
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          this.tenantId = this.$route.query.id;
          this.tenantDetail();
        });
      }
    },
    methods: {
      async tenantDetail() {
        const data = await getTenantDetail(this.tenantId);
        this.tenant = data;
      },

      updateTenant() {
        this.$refs.updateTenant.init(this.tenant);
        this.$refs.updateTenant.open();
      },
      forbidTenant() {
        const item = this.tenant;
        this.$store.commit('SET_CONFIRM', {
          title: this.$t('operate.disable_c', [this.$root.$t('resource.tenant')]),
          content: {
            text: `${this.$t('operate.disable_c', [this.$root.$t('resource.tenant')])} ${item.TenantName}`,
            type: 'confirm',
          },
          param: { item },
          doFunc: async (param) => {
            await putForbideTenant(param.item.ID);
            this.tenantDetail();
          },
        });
      },
      activeTenant() {
        const item = this.tenant;
        this.$store.commit('SET_CONFIRM', {
          title: this.$t('operate.enable_c', [this.$root.$t('resource.tenant')]),
          content: {
            text: `${this.$t('operate.enable_c', [this.$root.$t('resource.tenant')])} ${item.TenantName}`,
            type: 'confirm',
          },
          param: { item },
          doFunc: async (param) => {
            await putActiveTenant(param.item.ID);
            this.tenantDetail();
          },
        });
      },
      removeTenant() {
        const item = this.tenant;
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.tenant')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.tenant')])} ${item.TenantName}`,
            type: 'delete',
            name: item.TenantName,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteTenant(param.item.ID);
            this.$store.commit('CLEAR_TENANT');
            this.$store.dispatch('UPDATE_TENANT_DATA');
            this.$router.push({ name: 'tenant-list', params: this.$route.params });
          },
        });
      },
    },
  };
</script>
