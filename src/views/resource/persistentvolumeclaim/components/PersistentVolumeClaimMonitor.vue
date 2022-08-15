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
  <v-card>
    <v-card-title class="pt-2 pb-0">
      <v-flex>
        <v-flex class="float-right">
          <v-sheet class="text-body-2 text--darken-1">
            <BaseDatetimePicker v-model="date" :default-value="30" @change="onDatetimeChange(undefined)" />
          </v-sheet>
        </v-flex>
        <div class="kubegems__clear-float" />
      </v-flex>
    </v-card-title>
    <v-card-text :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`">
      <v-row>
        <v-col cols="6">
          <BaseApexAreaChart
            id="used"
            label="persistentvolumeclaim"
            :metrics="used"
            :title="$t('tip.used')"
            type="storage"
          />
        </v-col>
        <v-col cols="6">
          <BaseApexAreaChart
            id="inode"
            label="persistentvolumeclaim"
            :metrics="inodeused"
            :title="$t('tip.inode_rate')"
            type=""
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../i18n';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import { PVC_USAGE_INODE_PROMQL, PVC_USAGE_PROMQL } from '@/utils/prometheus';

  export default {
    name: 'PersistentVolumeClaimMonitor',
    i18n: {
      messages: messages,
    },
    mixins: [BasePermission, BaseResource],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      used: [],
      inodeused: [],
      date: [],
      params: {
        start: '',
        end: '',
        noprocessing: true,
      },
      timeinterval: null,
    }),
    computed: {
      ...mapState(['Scale']),
    },
    watch: {
      item() {
        this.loadMetrics();
      },
    },
    destroyed() {
      if (this.timeinterval) clearInterval(this.timeinterval);
    },
    mounted() {
      this.$nextTick(() => {
        this.onDatetimeChange();
      });
    },
    methods: {
      async loadMetrics() {
        if (this.timeinterval) clearInterval(this.timeinterval);
        this.loadData();
        this.timeinterval = setInterval(() => {
          this.params.start = this.$moment(this.params.start).utc().add(30, 'seconds').format();
          this.params.end = this.$moment(this.params.end).utc().add(30, 'seconds').format();
          this.loadData();
        }, 1000 * 30);
      },
      async loadData() {
        this.pvcUsage();
        this.pvcInodeUsage();
      },
      async pvcUsage() {
        const query = PVC_USAGE_PROMQL.replaceAll('$1', this.item.metadata.namespace).replaceAll(
          '$2',
          this.item.metadata.name,
        );
        const data = await this.m_permission_matrix(
          this.ThisCluster,
          Object.assign(this.params, { query: query, noprocessing: true }),
        );
        if (data) this.used = data;
      },
      async pvcInodeUsage() {
        const query = PVC_USAGE_INODE_PROMQL.replaceAll('$1', this.item.metadata.namespace).replaceAll(
          '$2',
          this.item.metadata.name,
        );
        const data = await this.m_permission_matrix(
          this.ThisCluster,
          Object.assign(this.params, { query: query, noprocessing: true }),
        );
        if (data) this.inodeused = data;
      },
      onDatetimeChange() {
        this.params.start = this.$moment(this.date[0]).utc().format();
        this.params.end = this.$moment(this.date[1]).utc().format();
        this.loadMetrics();
      },
    },
  };
</script>
