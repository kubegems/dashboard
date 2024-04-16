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
    attach="#login_tenant"
    bottom
    left
    nudge-bottom="5px"
    offset-y
    origin="top center"
    transition="scale-transition"
  >
    <template #activator="{ on }">
      <div id="login_tenant" />
      <v-btn class="primary--text font-weight-medium mb-1" color="white" dark depressed v-on="on">
        {{ hasTenant ? i18nLocal.t('tip.now_tenant') : i18n.t('resource.tenant') }}: &nbsp;
        <img class="locale__icon mr-2" :src="`/icon/tenant.svg`" width="18px" />
        {{ tenant || i18nLocal.t('tip.nil') }}
        <v-icon v-if="state.menu" right> mdi-chevron-up </v-icon>
        <v-icon v-else right> mdi-chevron-down </v-icon>
      </v-btn>
    </template>
    <v-data-iterator hide-default-footer :items="[{ text: i18nLocal.t('tip.i18n'), values: tenants }]">
      <template #no-data>
        <v-card>
          <v-card-text>{{ i18n.t('data.no_data') }} </v-card-text>
        </v-card>
      </template>
      <template #default="props">
        <v-card v-for="item in props.items" :key="item.text" flat max-height="300px" min-width="100px">
          <v-list dense>
            <v-flex class="text-subtitle-2 text-center ma-2">
              <span>{{ i18n.t('resource.tenant') }}</span>
            </v-flex>
            <v-divider class="mx-2" />
            <v-list-item
              v-for="(t, index) in item.values"
              :key="index"
              class="text-caption text-start font-weight-medium mx-2"
              link
              :style="{
                color: t.TenantName === tenant ? `var(--primary-color) !important` : ``,
                maxHeight: '300px',
                overflowY: 'auto',
              }"
              @click="setTenant(t)"
            >
              <v-list-item-content>
                <div>
                  <div class="float-left mr-2">
                    <img class="locale__icon" :src="`/icon/tenant.svg`" width="16px" />
                  </div>
                  <div class="float-left locale">{{ t.TenantName }}</div>
                  <div class="kubegems__clear-float" />
                </div>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </template>
    </v-data-iterator>
  </v-menu>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import { computed, reactive, ref } from 'vue';

  import { useI18n } from '../i18n';

  const store = useStore();
  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();

  const state = reactive({
    menu: false,
  });

  const hasTenant = computed(() => {
    return Boolean(store.getters.Tenant().TenantName);
  });

  const tenants = computed(() => {
    return store.state.TenantStore;
  });

  const emit = defineEmits(['input', 'change']);
  const tenant = ref(store.getters.Tenant().TenantName || void 0);
  const setTenant = (_t) => {
    tenant.value = _t.TenantName;
    store.dispatch('UPDATE_TENANT_DATA');
    emit('input', tenant.value);
    emit('change', tenant.value);
  };
</script>
