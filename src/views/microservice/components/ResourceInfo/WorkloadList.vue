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
  <v-data-table
    class="mx-4 pb-4"
    disable-sort
    :headers="headers"
    hide-default-footer
    :items="workloads"
    :no-data-text="$root.$t('data.no_data')"
  >
    <template #[`item.name`]="{ item, index }">
      <v-flex :id="`r${index}`" />
      <a class="text-subtitle-2 kubegems__inline_flex" @click.stop="microAppWorkoladDetail(item)">
        <v-flex class="float-left">
          {{ item.name }}
        </v-flex>
        <v-flex v-if="item.istioSidecar" class="float-left ml-2">
          <v-menu :attach="`#r${index}`" :close-delay="200" open-on-hover top>
            <template #activator="{ on }">
              <span v-on="on">
                <img class="workload__inject" src="/icon/istio.svg" width="18px" />
              </span>
            </template>
            <v-card>
              <v-card-text class="pa-2 text-caption">
                <span>{{ $t('tip.auto_inject') }}</span>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </a>
    </template>
    <template #[`item.labels`]="{ item }">
      <BaseCollapseChips v-if="item" id="w_label" :chips="item.labels || {}" icon="mdi-label" single-line />
    </template>
    <template #[`item.createdAt`]="{ item }">
      {{ item.createdAt ? $moment(item.createdAt).format('lll') : '' }}
    </template>
  </v-data-table>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../i18n';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'WorkloadList',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource],
    props: {
      workloads: {
        type: Array,
        default: () => [],
      },
    },
    computed: {
      ...mapState(['JWT']),
      ...mapGetters(['VirtualSpace']),
      headers() {
        return [
          { text: this.$t('table.name'), value: 'name', align: 'start' },
          { text: this.$root.$t('resource.type'), value: 'type', align: 'start' },
          { text: this.$t('table.pod_count'), value: 'podCount', align: 'start' },
          { text: this.$t('table.label'), value: 'labels', align: 'start', width: 500 },
          { text: this.$root.$t('resource.create_at'), value: 'createdAt', align: 'start' },
        ];
      },
    },
    methods: {
      microAppWorkoladDetail(item) {
        this.$router.push({
          name: 'microworkload-detail',
          params: Object.assign(this.$route.params, { name: item.name }),
          query: {
            type: item.type,
            namespace: this.$route.query.namespace,
            cluster: this.$route.query.cluster,
            environment: this.$route.query.environment,
            environmentid: this.$route.query.environmentid,
          },
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .workload {
    &__inject {
      margin-top: 2px;
    }
  }
</style>
