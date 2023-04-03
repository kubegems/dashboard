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
  <v-simple-table class="mx-2 pa-2 pb-3">
    <template #default>
      <thead>
        <tr>
          <th class="text-left">{{ $t('table.volume_name') }}</th>
          <th class="text-left">{{ $root.$t('resource.type') }}</th>
          <th class="text-left">{{ $t('table.key_path') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in volumes" :key="item.name">
          <td>{{ item.name }}</td>
          <td>
            {{ getVolumeType(item) }}
          </td>
          <td>
            <template v-if="getVolumeType(item) !== 'emptyDir'">
              {{ getVolumeKey(item) }}
            </template>
          </td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script>
  import messages from '../i18n';

  export default {
    name: 'DetailVolume',
    i18n: {
      messages: messages,
    },
    props: {
      volumes: {
        type: Array,
        default: () => [],
      },
    },
    methods: {
      getVolumeType(item) {
        if (item.emptyDir) return 'emptyDir';
        if (item.hostPath) return 'hostPath';
        if (item.configMap) return 'configMap';
        if (item.secret) return 'secret';
        if (item.persistentVolumeClaim) return 'persistentVolumeClaim';
        if (item.projected) return 'projected';
      },
      getVolumeKey(item) {
        if (item.emptyDir) return '';
        if (item.hostPath) return item.hostPath.path;
        if (item.configMap) return item.configMap.name;
        if (item.secret) return item.secret.secretName;
        if (item.persistentVolumeClaim) return item.persistentVolumeClaim.name;
        if (item.projected) return this.$t('tip.projected_volume');
      },
    },
  };
</script>
