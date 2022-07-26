<!-- 
  Copyright 2022 The kubegems.io Authors

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License. 
-->

<template>
  <div>
    <v-card>
      <v-sheet class="pa-2">
        <BaseListItemForDetail :mt="0" title="generation">
          <template #content>
            {{ crd ? crd.metadata.generation : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="Kind">
          <template #content>
            {{ crd ? crd.spec.names.kind : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="Scope">
          <template #content>
            {{ crd ? crd.spec.scope : '' }}
          </template>
        </BaseListItemForDetail>
      </v-sheet>
    </v-card>

    <v-card class="mt-3">
      <BaseSubTitle class="pt-2" :divider="false" title="状况" />
      <v-simple-table class="mx-2 pa-2 pb-3">
        <template #default>
          <thead>
            <tr>
              <th class="text-left">Reason</th>
              <th class="text-left">状态</th>
              <th class="text-left">Type</th>
              <th class="text-left">Message</th>
              <th class="text-left">上次更新时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in crd ? crd.status.conditions : []" :key="item.reason">
              <td>{{ item.reason }}</td>
              <td>
                <span v-if="item.status === 'True'">
                  <v-icon color="primary" small> fas fa-check-circle </v-icon>
                </span>
                <span v-else>
                  <v-icon color="error" small>fas fa-minus-circle</v-icon>
                </span>
              </td>
              <td>{{ item.type }}</td>
              <td>{{ item.message }}</td>
              <td>{{ $moment(item.lastUpdateTime).format('lll') }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>
  </div>
</template>

<script>
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'ResourceInfo',
    mixins: [BaseResource],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        crd: null,
      };
    },
    watch: {
      item() {
        this.crd = deepCopy(this.item);
      },
    },
    mounted() {
      if (this.item) this.crd = deepCopy(this.item);
    },
  };
</script>
