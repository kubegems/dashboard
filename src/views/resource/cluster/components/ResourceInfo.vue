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
  <v-card class="rounded-t-0" flat height="55%">
    <v-card-text class="d-flex pl-6 align-center flex-wrap" :style="{ height: `100%` }">
      <div class="d-flex align-center justify-start my-2" :style="{ width: `50%` }">
        <v-btn class="elevation-0 mr-2" color="primary" dark fab small>
          <v-icon>{{ $RESOURCE_ICON['node'] }}</v-icon>
        </v-btn>
        <h6 class="text-large-size font-weight-regular">
          {{ $root.$t('resource.node') }} {{ workload && workload['node'] ? workload['node'] : '' }}
        </h6>
      </div>
      <div class="d-flex align-center justify-start my-2" :style="{ width: `50%` }">
        <v-btn class="elevation-0 mr-2" color="primary" dark fab small>
          <v-icon>{{ $RESOURCE_ICON['cpu'] }}</v-icon>
        </v-btn>
        <div>
          <h5 class="text-size font-weight-regular">
            {{ $root.$t('resource.cpu_c', [$t('tip.physics')]) }}
            {{ quota ? sizeOfCpu(quota.capacity.cpu).toFixed(1) : 0 }}
            core (1:{{ cluster ? cluster.OversoldConfig.cpu : 1 }})
          </h5>
          <h5 class="text-size font-weight-regular">
            {{ $root.$t('resource.cpu_c', [$t('tip.virtual')]) }}
            {{ quota && cluster ? (sizeOfCpu(quota.capacity.cpu) * cluster.OversoldConfig.cpu).toFixed(1) : 0 }}
            core
          </h5>
        </div>
      </div>
      <div class="d-flex align-center justify-start my-2" :style="{ width: `50%` }">
        <v-btn class="elevation-0 mr-2" color="primary" dark fab small>
          <v-icon>{{ $RESOURCE_ICON['storage'] }}</v-icon>
        </v-btn>
        <div>
          <h5 class="text-size font-weight-regular">
            {{ $root.$t('resource.storage_c', [$t('tip.physics')]) }}
            {{ quota ? sizeOfStorage(quota.capacity['ephemeral-storage']).toFixed(1) : 0 }}
            Gi (1:{{ cluster ? cluster.OversoldConfig.storage : 1 }})
          </h5>
          <h5 class="text-size font-weight-regular">
            {{ $root.$t('resource.storage_c', [$t('tip.virtual')]) }}
            {{
              quota && cluster
                ? (sizeOfStorage(quota.capacity['ephemeral-storage']) * cluster.OversoldConfig.storage).toFixed(1)
                : 0
            }}
            Gi
          </h5>
        </div>
      </div>
      <div class="d-flex align-center justify-start my-2" :style="{ width: `50%` }">
        <v-btn class="elevation-0 mr-2" color="primary" dark fab small>
          <v-icon>{{ $RESOURCE_ICON['memory'] }}</v-icon>
        </v-btn>
        <div>
          <h5 class="text-size font-weight-regular">
            {{ $root.$t('resource.memory_c', [$t('tip.physics')]) }}
            {{ quota ? sizeOfStorage(quota.capacity.memory).toFixed(1) : 0 }}
            Gi (1:{{ cluster ? cluster.OversoldConfig.memory : 1 }})
          </h5>
          <h5 class="text-size font-weight-regular">
            {{ $root.$t('resource.memory_c', [$t('tip.virtual')]) }}
            {{
              quota && cluster ? (sizeOfStorage(quota.capacity.memory) * cluster.OversoldConfig.memory).toFixed(1) : 0
            }}
            Gi
          </h5>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
  import messages from '../i18n';
  import BaseResource from '@/mixins/resource';
  import { sizeOfCpu, sizeOfStorage } from '@/utils/helpers';

  export default {
    name: 'ResourceInfo',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource],
    props: {
      cluster: {
        type: Object,
        default: () => null,
      },
      quota: {
        type: Object,
        default: () => null,
      },
      workload: {
        type: Object,
        default: () => null,
      },
    },
    methods: {
      sizeOfCpu: sizeOfCpu,
      sizeOfStorage: sizeOfStorage,
    },
  };
</script>

<style lang="scss" scoped>
  .text-size {
    font-size: 15px;
  }

  .text-large-size {
    font-size: 17px;
  }
</style>
