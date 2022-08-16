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
        <BaseListItemForDetail :mt="0" :title="$root.$t('resource.node')">
          <template #content>
            {{ pod ? pod.spec.nodeName : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail :title="$t('tip.ip', [$root.$t('resource.pod')])">
          <template #content>
            {{ pod ? pod.status.podIP : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail :title="$t('tip.ip', [$root.$t('resource.node')])">
          <template #content>
            {{ pod ? pod.status.hostIP : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="QOS">
          <template #content>
            {{ pod ? pod.status.qosClass : '' }}
          </template>
        </BaseListItemForDetail>
      </v-sheet>
    </v-card>

    <v-card class="mt-3" flat>
      <BaseSubTitle class="pt-2" :divider="false" :title="$root.$t('resource.container')" />
      <DetailContainer
        :containers="
          pod
            ? pod.spec.containers.concat(
                pod.spec.initContainers
                  ? pod.spec.initContainers.map((i) => {
                      return { ...i, showName: `${i.name} (init)` };
                    })
                  : [],
              )
            : []
        "
      />
    </v-card>

    <v-card class="mt-3" flat>
      <BaseSubTitle class="pt-2" :divider="false" :title="$t('tip.volume')" />
      <DetailVolume :volumes="pod ? pod.spec.volumes : []" />
    </v-card>

    <v-card class="mt-3" flat>
      <BaseSubTitle class="pt-2" :divider="false" :title="$t('tip.env')" />
      <DetailEnv :containers="pod ? pod.spec.containers : []" />
    </v-card>

    <v-card class="mt-3" flat>
      <BaseSubTitle class="pt-2" :divider="false" :title="$t('tip.condition')" />
      <v-simple-table class="mx-2 pa-2 pb-3">
        <template #default>
          <thead>
            <tr>
              <th class="text-left">Type</th>
              <th class="text-left">{{ $t('table.status') }}</th>
              <th class="text-left">{{ $t('tip.last_change_at') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in pod ? pod.status.conditions : []" :key="index">
              <td>{{ item.type }}</td>
              <td>
                <span v-if="item.status === 'True'">
                  <v-icon color="primary" small> mdi-check-circle </v-icon>
                </span>
                <span v-else>
                  <v-icon color="error" small> mdi-minus-circle </v-icon>
                </span>
              </td>
              <td>{{ $moment(item.lastUpdateTime).format('lll') }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>
  </div>
</template>

<script>
  import messages from '../i18n';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';
  import DetailContainer from '@/views/resource/components/common/DetailContainer';
  import DetailEnv from '@/views/resource/components/common/DetailEnv';
  import DetailVolume from '@/views/resource/components/common/DetailVolume';

  export default {
    name: 'ResourceInfo',
    i18n: {
      messages: messages,
    },
    components: {
      DetailContainer,
      DetailEnv,
      DetailVolume,
    },
    mixins: [BaseResource],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        pod: null,
      };
    },
    watch: {
      item() {
        this.pod = deepCopy(this.item);
      },
    },
    mounted() {
      if (this.item) this.pod = deepCopy(this.item);
    },
  };
</script>
