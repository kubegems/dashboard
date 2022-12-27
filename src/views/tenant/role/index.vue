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
    <v-card>
      <v-card-text>
        <v-data-table
          disable-sort
          :headers="headers"
          hide-default-footer
          :items="items"
          :items-per-page="100"
          :no-data-text="i18n.t('data.no_data')"
        />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
  import { useI18n } from './i18n';
  import { useGlobalI18n } from '@/i18n';

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();

  const headers = [
    { text: i18nLocal.t('table.role'), value: 'role', align: 'start', width: 300 },
    { text: i18nLocal.t('table.type'), value: 'type', align: 'start' },
    { text: i18nLocal.t('table.description'), value: 'description', align: 'start' },
  ];

  const items = [
    {
      id: 1,
      role: i18n.t('role.system.administrator'),
      type: i18n.t('resource.system'),
      description: i18nLocal.t('tip.system.admin'),
    },
    {
      id: 2,
      role: i18n.t('role.system.normal'),
      type: i18n.t('resource.system'),
      description: i18nLocal.t('tip.system.normal'),
    },

    {
      id: 3,
      role: i18n.t('role.tenant.admin'),
      type: i18n.t('resource.tenant'),
      description: i18nLocal.t('tip.tenant.admin'),
    },
    {
      id: 4,
      role: i18n.t('role.tenant.ordinary'),
      type: i18n.t('resource.tenant'),
      description: i18nLocal.t('tip.tenant.normal'),
    },

    {
      id: 5,
      role: i18n.t('role.project.admin'),
      type: i18n.t('resource.project'),
      description: i18nLocal.t('tip.project.admin'),
    },
    {
      id: 6,
      role: i18n.t('role.project.test'),
      type: i18n.t('resource.project'),
      description: i18nLocal.t('tip.project.test'),
    },
    {
      id: 7,
      role: i18n.t('role.project.dev'),
      type: i18n.t('resource.project'),
      description: i18nLocal.t('tip.project.dev'),
    },
    {
      id: 8,
      role: i18n.t('role.project.ops'),
      type: i18n.t('resource.project'),
      description: i18nLocal.t('tip.project.ops'),
    },

    {
      id: 9,
      role: i18n.t('role.environment.reader'),
      type: i18n.t('resource.project'),
      description: i18nLocal.t('tip.environment.reader'),
    },
    {
      id: 10,
      role: i18n.t('role.environment.operator'),
      type: i18n.t('resource.project'),
      description: i18nLocal.t('tip.environment.operator'),
    },
    {
      id: 11,
      role: i18n.t('role.mesh.normal'),
      type: i18n.t('resource.mesh'),
      description: i18nLocal.t('tip.mesh.normal'),
    },
    {
      id: 12,
      role: i18n.t('role.mesh.administrator'),
      type: i18n.t('resource.mesh'),
      description: i18nLocal.t('tip.mesh.admin'),
    },
  ];
</script>
