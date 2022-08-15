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
  <BasePanel v-model="panel" icon="mdi-clipboard-list" :title="title" :width="`50%`" @dispose="dispose">
    <template #header>
      <span class="ml-3">
        {{ Environment().Namespace }}
      </span>
    </template>
    <template #action>
      <v-flex class="mt-n1">
        <v-sheet class="text-body-1 text--darken-1 primary white--text">
          <BaseDatePicker @date="updateDate" />
        </v-sheet>
      </v-flex>
    </template>
    <template #content>
      <v-card-text>
        <v-card-title class="primary--text text-h6 py-2">
          <v-icon class="mr-2 primary--text" left> mdi-cpu-64-bit </v-icon>
          {{ $root.$t('resource.cpu') }}
        </v-card-title>
        <v-data-table
          class="mb-8"
          disable-sort
          :headers="headersCpu"
          hide-default-footer
          :items="itemsObj.cpuItems"
          :no-data-text="$root.$t('data.no_data')"
        />
        <v-card-title class="primary--text text-h6 py-2">
          <v-icon class="mr-2 primary--text" left> mdi-nas </v-icon>
          {{ $root.$t('resource.memory') }}
        </v-card-title>
        <v-data-table
          class="mb-8"
          disable-sort
          :headers="headersCpu"
          hide-default-footer
          :items="itemsObj.memoryItems"
          :no-data-text="$root.$t('data.no_data')"
        />
        <v-card-title class="primary--text text-h6 py-2">
          <v-icon class="mr-2 primary--text" left> mdi-database </v-icon>
          {{ $root.$t('resource.storage') }}
        </v-card-title>
        <v-data-table
          class="mb-8"
          disable-sort
          :headers="headersCpu"
          hide-default-footer
          :items="itemsObj.storageItems"
          :no-data-text="$root.$t('data.no_data')"
        />
        <v-card-title class="primary--text text-h6 py-2">
          <v-icon class="mr-2 primary--text" left> mdi-earth </v-icon>
          {{ $t('tip.traffic') }}
        </v-card-title>
        <v-data-table
          disable-sort
          :headers="headersNetwork"
          hide-default-footer
          :items="itemsObj.networkItems"
          :no-data-text="$root.$t('data.no_data')"
        />
      </v-card-text>
    </template>
  </BasePanel>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../i18n';
  import { getEnvironmentResourceUsage, getProjectResourceUsage } from '@/api';
  import { ResourceBeatifulMixin } from '@/views/resource/environment/mixins/resourcebeatiful';

  export default {
    name: 'ResourceUseList',
    i18n: {
      messages: messages,
    },
    mixins: [ResourceBeatifulMixin],
    props: {
      title: {
        type: String,
        default: () => '',
      },
      type: {
        type: String,
        default: () => '',
      },
    },
    data: () => ({
      panel: false,
      resourceUseDetail: {},
      itemsObj: {},
    }),
    computed: {
      ...mapState(['JWT', 'AdminViewport']),
      ...mapGetters(['Environment', 'Project']),
      headersCpu() {
        return [
          { text: this.$t('tip.max'), value: 'max', align: 'start' },
          { text: this.$t('tip.min'), value: 'min', align: 'start' },
          { text: this.$t('tip.avg'), value: 'avg', align: 'start' },
        ];
      },
      headersNetwork() {
        return [
          { text: this.$t('tip.send'), value: 'out', align: 'start' },
          { text: this.$t('tip.receive'), value: 'in', align: 'start' },
        ];
      },
    },
    methods: {
      open() {
        this.panel = true;
      },
      updateDate(currentDate) {
        const queryDate = this.$moment(currentDate).format();
        this.getResourceUsage(queryDate);
      },
      async init() {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        const yestodayBasicFormatUTC = this.$moment(yesterday).format();
        this.getResourceUsage(yestodayBasicFormatUTC);
      },
      async getResourceUsage(queryDate) {
        this.tableData = [];
        this.tableDataNetworkFlow = [];
        const params = { date: queryDate, noprocessing: true };
        if (this.type === 'env') {
          this.resourceUseDetail = await getEnvironmentResourceUsage(this.Environment().ID, params);
        } else {
          this.resourceUseDetail = await getProjectResourceUsage(this.Project().ID, params);
        }
        if (this.resourceUseDetail) {
          this.itemsObj = this.getResourceBeatiful(this.resourceUseDetail);
        }
      },
      dispose() {
        this.tableData = [];
      },
    },
  };
</script>
