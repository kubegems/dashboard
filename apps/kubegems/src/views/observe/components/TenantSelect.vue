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
  <v-flex class="kubegems__full-right">
    <v-sheet class="text-body-2 text--darken-1 d-flex align-center mx-1">
      <span class="text-body-2 mt-0 mr-1">{{ $root.$t('resource.tenant') }}</span>
      <v-menu
        v-model="tenantMenu"
        bottom
        class="mx-1 px-1"
        left
        offset-y
        origin="top center"
        transition="scale-transition"
      >
        <template #activator="{ on }">
          <v-btn class="primary--text font-weight-medium" color="white" text v-on="on">
            {{ tenant ? tenant.TenantName : '' }}
            <v-icon v-if="tenantMenu" right> mdi-chevron-up </v-icon>
            <v-icon v-else right> mdi-chevron-down </v-icon>
          </v-btn>
        </template>
        <v-data-iterator
          class="file-iterator"
          hide-default-footer
          :items="[{ text: $root.$t('resource.tenant'), values: tenants }]"
        >
          <template #no-data>
            <v-card>
              <v-card-text> {{ $root.$t('data.no_data') }} </v-card-text>
            </v-card>
          </template>
          <template #default="props">
            <v-card v-for="item in props.items" :key="item.text" flat min-width="120">
              <v-list dense>
                <v-flex class="text-subtitle-2 text-center ma-2">
                  <span>{{ $root.$t('resource.tenant') }}</span>
                </v-flex>
                <v-divider class="mx-2" />
                <v-list-item
                  v-for="(ten, index) in item.values"
                  :key="index"
                  class="text-body-2 text-center font-weight-medium kubegems__text mx-2"
                  link
                  :style="{ color: ten.text === tenant.TenantName ? `#1e88e5 !important` : `` }"
                  @click="setTenant(ten)"
                >
                  <v-list-item-content>
                    <span>{{ ten.text }}</span>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </template>
        </v-data-iterator>
      </v-menu>
    </v-sheet>
  </v-flex>
</template>

<script>
  import { mapGetters } from 'vuex';

  import BaseSelect from '@/mixins/select';

  export default {
    name: 'TenantSelect',
    mixins: [BaseSelect],
    data() {
      return {
        tenantMenu: false,
        tenant: null,
      };
    },
    computed: {
      ...mapGetters(['Tenant']),
      tenants() {
        return this.m_select_tenantItems.filter((t) => {
          return t.isActive && !t.disabled;
        });
      },
    },
    watch: {
      value: {
        handler(newValue) {
          this.tenant = newValue;
        },
        deep: true,
      },
    },
    mounted() {
      this.$nextTick(async () => {
        await this.m_select_tenantSelectData();
        if (this.tenants?.length > 0) {
          const t = this.tenants[0];
          this.tenant = {
            ID: t.value,
            TenantName: t.text,
          };
          this.$emit('input', this.tenant);
          this.$emit('change', this.tenant);
        } else {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$root.$t('data.no_data'),
            color: 'warning',
          });
        }
      });
    },
    methods: {
      setTenant(tenant) {
        if (tenant.text !== this.tenant.TenantName) {
          this.tenant = {
            ID: tenant.value,
            TenantName: tenant.text,
          };
          this.$emit('input', this.tenant);
          this.$emit('change', this.tenant);
        }
      },
    },
  };
</script>
