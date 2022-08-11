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
          :no-data-text="$root.$t('data.no_data')"
        />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
  import messages from './i18n';

  export default {
    name: 'Role',
    i18n: {
      messages: messages,
    },
    computed: {
      headers() {
        return [
          { text: this.$t('table.role'), value: 'role', align: 'start', width: 300 },
          { text: this.$t('table.type'), value: 'type', align: 'start' },
          { text: this.$t('table.description'), value: 'description', align: 'start' },
        ];
      },
      items() {
        return [
          {
            id: 1,
            role: this.$root.$t('role.system.administrator'),
            type: this.$root.$t('resource.system'),
            description: this.$t('tip.system.admin'),
          },
          {
            id: 2,
            role: this.$root.$t('role.system.normal'),
            type: this.$root.$t('resource.system'),
            description: this.$t('tip.system.normal'),
          },

          {
            id: 3,
            role: this.$root.$t('role.tenant.admin'),
            type: this.$root.$t('resource.tenant'),
            description: this.$t('tip.tenant.admin'),
          },
          {
            id: 4,
            role: this.$root.$t('role.tenant.ordinary'),
            type: this.$root.$t('resource.tenant'),
            description: this.$t('tip.tenant.normal'),
          },

          {
            id: 5,
            role: this.$root.$t('role.project.admin'),
            type: this.$root.$t('resource.project'),
            description: this.$t('tip.project.admin'),
          },
          {
            id: 6,
            role: this.$root.$t('role.project.test'),
            type: this.$root.$t('resource.project'),
            description: this.$t('tip.project.test'),
          },
          {
            id: 7,
            role: this.$root.$t('role.project.dev'),
            type: this.$root.$t('resource.project'),
            description: this.$t('tip.project.dev'),
          },
          {
            id: 8,
            role: this.$root.$t('role.project.ops'),
            type: this.$root.$t('resource.project'),
            description: this.$t('tip.project.ops'),
          },

          {
            id: 9,
            role: this.$root.$t('role.environment.reader'),
            type: this.$root.$t('resource.project'),
            description: this.$t('tip.environment.reader'),
          },
          {
            id: 10,
            role: this.$root.$t('role.environment.operator'),
            type: this.$root.$t('resource.project'),
            description: this.$t('tip.environment.operator'),
          },
          {
            id: 11,
            role: this.$root.$t('role.mesh.normal'),
            type: this.$root.$t('resource.mesh'),
            description: this.$t('tip.mesh.normal'),
          },
          {
            id: 12,
            role: this.$root.$t('role.mesh.administrator'),
            type: this.$root.$t('resource.mesh'),
            description: this.$t('tip.mesh.admin'),
          },
        ];
      },
    },
  };
</script>
