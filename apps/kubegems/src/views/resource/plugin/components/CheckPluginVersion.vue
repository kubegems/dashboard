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
  <BaseDialog
    v-model="dialog"
    icon="mdi-arrow-up-bold-circle"
    :title="$t('operate.check_upgrade')"
    :width="500"
    @reset="reset"
  >
    <template #content>
      <v-text-field v-model="search" class="mx-2 mt-2 pt-0" hide-details prepend-inner-icon="mdi-magnify" />

      <v-data-table
        class="px-2"
        dense
        :headers="headers"
        hide-default-footer
        item-key="value"
        :items="versionItems"
        :items-per-page="100"
        :no-data-text="$root.$t('data.no_data')"
        :no-results-text="$root.$t('data.no_data')"
        :page="1"
        :search.sync="search"
      >
        <template #[`item.upgradeableVersion`]="{ item }">
          <v-icon
            v-if="item.upgradeableVersion && item.upgradeableVersion !== item.installedVersion"
            color="warning"
            right
            small
          >
            mdi-arrow-up-bold-circle
          </v-icon>
          {{ item.upgradeableVersion }}
        </template>
      </v-data-table>
    </template>
  </BaseDialog>
</template>

<script>
  import messages from '../i18n';

  export default {
    name: 'CheckPluginVersion',
    i18n: {
      messages: messages,
    },
    data() {
      return {
        dialog: false,
        versionItems: [],
        search: '',
      };
    },
    computed: {
      headers() {
        return [
          { text: this.$t('table.name'), value: 'name', align: 'start' },
          { text: this.$t('table.installed_version'), value: 'installedVersion', align: 'start' },
          { text: this.$t('table.upgrade_version'), value: 'upgradeableVersion', align: 'start' },
        ];
      },
    },
    methods: {
      open() {
        this.dialog = true;
      },
      init(data) {
        this.versionItems = data;
      },
      reset() {
        this.versionItems = [];
      },
    },
  };
</script>
