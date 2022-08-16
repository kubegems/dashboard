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
  <v-row>
    <v-col class="py-0 mb-3" cols="3">
      <BaseInfoCard
        icon="mdi-cpu-64-bit"
        :large="false"
        :num="item && item.spec.server.resources.limits ? item.spec.server.resources.limits.cpu : 0"
        :title="$t('tip.allocated', [$root.$t('resource.cpu')])"
      />
    </v-col>
    <v-col class="py-0 mb-3" cols="3">
      <BaseInfoCard
        icon="mdi-nas"
        :large="false"
        :num="item && item.spec.server.resources.limits ? item.spec.server.resources.limits.memory : 0"
        :title="$t('tip.allocated', [$root.$t('resource.memory')])"
      />
    </v-col>
    <v-col class="py-0 mb-3" cols="3">
      <BaseInfoCard
        icon="mdi-memory"
        :large="false"
        :num="gpu ? gpu : $t('tip.unallocated')"
        :title="$t('tip.allocated', [$root.$t('resource.gpu')])"
      />
    </v-col>
    <v-col class="py-0 mb-3" cols="3">
      <BaseInfoCard
        icon="mdi-nas"
        :large="false"
        :num="gpuStorage ? gpuStorage : $t('tip.unallocated')"
        :title="$t('tip.allocated', [$root.$t('resource.video_memory')])"
      />
    </v-col>
  </v-row>
</template>

<script>
  import messages from '../../i18n';

  export default {
    name: 'DashboardCard',
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
        gpu: 0,
        gpuStorage: 0,
      };
    },
    watch: {
      item: {
        handler(newValue) {
          if (newValue) {
            if (newValue?.spec?.server?.resources?.limits?.[`limits.nvidia.com/gpu`]) {
              this.gpu = parseFloat(newValue?.spec?.server?.resources?.limits?.[`limits.nvidia.com/gpu`]);
            }
            if (newValue?.spec?.server?.resources?.limits?.[`tencent.com/vcuda-core`]) {
              this.gpu += parseFloat(newValue?.spec?.server?.resources?.limits?.[`tencent.com/vcuda-core`]) / 100;
            }
            if (newValue?.spec?.server?.resources?.limits?.[`tencent.com/vcuda-memory`]) {
              this.gpuStorage =
                (parseFloat(newValue?.spec?.server?.resources?.limits?.[`tencent.com/vcuda-memory`]) * 256) / 1024;
            }
          }
        },
        deep: true,
        immediate: true,
      },
    },
  };
</script>
