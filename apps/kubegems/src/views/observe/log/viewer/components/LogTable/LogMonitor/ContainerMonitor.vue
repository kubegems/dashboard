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
  <v-card :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`" flat>
    <v-card-text>
      <v-row>
        <v-col cols="6">
          <BaseAreaChart
            :global-plugins-check="false"
            label="container"
            :metrics="cpu"
            mode="x"
            :title="$t('tip.used', [$root.$t('resource.cpu')])"
            type="cpu"
          />
        </v-col>
        <v-col cols="6">
          <BaseAreaChart
            :global-plugins-check="false"
            label="container"
            :metrics="memory"
            mode="x"
            :title="$t('tip.used', [$root.$t('resource.memory')])"
            unit="Mi"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
  import { CONTAINER_CPU_USAGE_PROMQL, CONTAINER_MEMORY_USAGE_PROMQL } from '@kubegems/libs/constants/prometheus';
  import { mapState } from 'vuex';

  import messages from '../../../../i18n';
  import { getPodDetail } from '@/api';
  import BasePermission from '@/mixins/permission';

  export default {
    name: 'ContainerMonitor',
    i18n: {
      messages: messages,
    },
    mixins: [BasePermission],
    props: {
      date: {
        type: Array,
        default: () => [],
      },
      item: {
        type: Object,
        default: () => ({}),
      },
    },
    data() {
      return {
        cpu: [],
        memory: [],
        params: {
          start: '',
          end: '',
          pass: true,
        },
        timeinterval: null,
        containers: [],
      };
    },
    computed: {
      ...mapState(['Scale']),
    },
    watch: {
      date: {
        handler: async function (newValue) {
          if (newValue?.length === 2) {
            this.params.start = this.$moment(this.date[0]).utc().format();
            this.params.end = this.$moment(this.date[1]).utc().format();
            if (this.containers?.length === 0) await this.podDetail();
            this.loadMetrics();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    destroyed() {
      if (this.timeinterval) clearInterval(this.timeinterval);
    },
    methods: {
      async podDetail() {
        const data = await getPodDetail(this.item.stream?.cluster, this.item.stream?.namespace, this.item.stream?.pod, {
          noprocessing: true,
        });
        this.containers = data.spec.containers.map((c) => {
          return c.name;
        });
      },
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
        this.podCPUUsage();
        this.podMemoryUsage();
      },
      async podCPUUsage() {
        if (this.item) {
          const query = CONTAINER_CPU_USAGE_PROMQL.replaceAll('$1', this.containers.join('|'))
            .replaceAll('$2', this.item.stream?.pod)
            .replaceAll('$3', this.item.stream?.namespace);
          const data = await this.m_permission_matrix(
            this.item.stream?.cluster,
            Object.assign(this.params, { query: query }),
          );
          if (data) this.cpu = data;
        }
      },
      async podMemoryUsage() {
        if (this.item) {
          const query = CONTAINER_MEMORY_USAGE_PROMQL.replaceAll('$1', this.containers.join('|'))
            .replaceAll('$2', this.item.stream?.pod)
            .replaceAll('$3', this.item.stream?.namespace);
          const data = await this.m_permission_matrix(
            this.item.stream?.cluster,
            Object.assign(this.params, { query: query }),
          );
          if (data) this.memory = data;
        }
      },
    },
  };
</script>
