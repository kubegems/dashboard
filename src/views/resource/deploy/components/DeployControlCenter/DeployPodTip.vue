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
  <v-flex>
    <BaseTipWindow
      v-for="(pod, index) in pods"
      :key="index"
      icon="mdi-cube"
      :max-width="180"
      :title="$root.$t('resource.pod')"
      top
    >
      <template #header>
        <v-icon v-if="pod.status === 'Running'" class="mx-0-5 icon-font" :color="getColor(pod.ready)">
          mdi-cube
        </v-icon>
        <v-icon
          v-else-if="
            ['ContainerCreating', 'Pending', 'PodInitializing', 'Terminating'].indexOf(pod.status) > -1 ||
            pod.status.indexOf('Init') > -1
          "
          class="mx-0-5 icon-font kubegems__waiting-circle-flashing"
          color="warning"
        >
          mdi-autorenew
        </v-icon>
        <v-icon v-else-if="['Completed', 'Evicted'].indexOf(pod.status) > -1" class="mx-0-5 icon-font" color="grey">
          mdi-alert-box
        </v-icon>
        <v-icon v-else class="mx-0-5 icon-font" color="error"> mdi-close-box </v-icon>
      </template>
      <template #content>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>{{ $t('table.name') }}</v-list-item-title>
            <v-list-item-content class="text-caption kubegems__text">
              {{ pod.objectMeta.name }}
            </v-list-item-content>
            <v-list-item-title>{{ $t('table.status') }}</v-list-item-title>
            <v-list-item-content class="text-caption kubegems__text">
              {{ pod.status }}
            </v-list-item-content>
            <v-list-item-title>{{ $root.$t('resource.container') }}</v-list-item-title>
            <v-list-item-content class="text-caption kubegems__text my-0">
              {{ pod.ready }}
            </v-list-item-content>
          </v-list-item-content>
        </v-list-item>
      </template>
    </BaseTipWindow>
  </v-flex>
</template>

<script>
  import messages from '../../i18n';

  export default {
    name: 'DeployPodTip',
    i18n: {
      messages: messages,
    },
    props: {
      pods: {
        type: Array,
        default: () => [],
      },
    },
    methods: {
      getColor(status) {
        if (status) {
          const s = status.split('/');
          if (s.length === 2) {
            if (parseInt(s[0]) === parseInt(s[1])) {
              return 'success';
            } else {
              return 'warning';
            }
          }
          return 'success';
        }
        return 'success';
      },
    },
  };
</script>
