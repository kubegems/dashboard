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
  <div>
    <v-card>
      <v-sheet class="pa-2">
        <BaseListItemForDetail :mt="0" :title="$t('tip.match_app')">
          <template #content>
            <BaseCollapseChips v-if="flow" id="r_app" :chips="matchs" icon="mdi-apps" single-line />
          </template>
        </BaseListItemForDetail>
        <BaseListItemForDetail :title="$t('tip.filter')">
          <template #content>
            <BaseCollapseChips v-if="flow" id="r_fliter" :chips="filters" icon="mdi-filter" single-line />
          </template>
        </BaseListItemForDetail>
        <BaseListItemForDetail :title="`${$t('table.output')}(Output)`">
          <template #content>
            <BaseCollapseChips
              v-if="flow"
              id="r_output"
              :chips="flow.spec.localOutputRefs"
              icon="mdi-router-wireless"
              single-line
            />
          </template>
        </BaseListItemForDetail>
        <BaseListItemForDetail :title="`${$t('table.output')}(ClusterOutput)`">
          <template #content>
            <BaseCollapseChips
              v-if="flow"
              id="r_clusteroutput"
              :chips="flow.spec.globalOutputRefs"
              icon="mdi-router-wireless"
              single-line
            />
          </template>
        </BaseListItemForDetail>
      </v-sheet>
    </v-card>
  </div>
</template>

<script>
  import messages from '../../../i18n';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'ResourceInfo',
    i18n: {
      messages: messages,
    },
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        flow: null,
      };
    },
    computed: {
      matchs() {
        if (this.flow.spec.match) {
          return this.flow.spec.match.length > 1
            ? this.flow.spec.match.reduce((m1, m2) => {
                return Array.isArray(m1)
                  ? m1.concat([m2.select.labels.app])
                  : [m1.select.labels.app].concat([m2.select.labels.app]);
              })
            : this.flow.spec.match.map((m) => {
                return m.select.labels.app;
              });
        }
        return [];
      },
      filters() {
        return this.flow.spec.filters.length > 1
          ? this.flow.spec.filters.reduce((f1, f2) => {
              return Array.isArray(f1) ? f1.concat(Object.keys(f2)) : Object.keys(f1).concat(Object.keys(f2));
            })
          : this.flow.spec.filters
              .map((f) => {
                return Object.keys(f);
              })
              .flat();
      },
    },
    watch: {
      item() {
        this.flow = deepCopy(this.item);
      },
    },
    mounted() {
      if (this.item) this.flow = deepCopy(this.item);
    },
  };
</script>
