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
        :num="`${gpuLimit} ${$t('tip.core')}`"
        :title="$t('tip.limits', [$root.$t('resource.gpu')])"
      />
    </v-col>
    <v-col class="py-0 mb-3" cols="3">
      <BaseInfoCard
        icon="mdi-nas"
        :large="false"
        :num="`${gpuMemoryLimit} Gi`"
        :title="$t('tip.limits', [$root.$t('resource.video_memory')])"
      />
    </v-col>
    <v-col class="py-0 mb-3" cols="3">
      <BaseInfoCard
        icon="mdi-memory"
        :large="false"
        :num="`${gpuRequest} ${$t('tip.core')}`"
        :title="$t('tip.requests', [$root.$t('resource.gpu')])"
      />
    </v-col>
    <v-col class="py-0 mb-3" cols="3">
      <BaseInfoCard
        icon="mdi-nas"
        :large="false"
        :num="`${gpuMemoryRequest} Gi`"
        :title="$t('tip.requests', [$root.$t('resource.video_memory')])"
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
      type: {
        type: String,
        default: () => 'Pod',
      },
    },
    data() {
      return {
        gpuLimit: 0,
        gpuMemoryLimit: 0,
        gpuRequest: 0,
        gpuMemoryRequest: 0,
      };
    },
    mounted() {
      this.$nextTick(() => {
        this.getGpuAllocated();
      });
    },
    methods: {
      getGpuAllocated() {
        let containers = [];
        if (this.type === 'ModelDeployment') {
          this.gpuLimit += parseFloat(this.item.spec?.server?.resources?.limits?.[`tencent.com/vcuda-core`]) / 100;
          this.gpuMemoryLimit =
            (parseFloat(this.item.spec?.server?.resources?.limits?.[`tencent.com/vcuda-memory`]) * 256) / 1024;
          this.gpuRequest = parseFloat(this.item.spec?.server?.resources?.requests?.[`tencent.com/vcuda-core`]) / 100;
          this.gpuMemoryRequest =
            (parseFloat(this.item.spec?.server?.resources?.requests?.[`tencent.com/vcuda-memory`]) * 256) / 1024;
          return;
        }
        if (this.type === 'Pod') {
          containers = this.item.spec.containers;
        } else {
          containers = this.item.spec.template.spec.containers;
        }
        containers.forEach((c) => {
          this.gpuLimit += parseFloat(c?.resources?.limits && c?.resources?.limits['tencent.com/vcuda-core']) / 100;
          this.gpuMemoryLimit =
            (parseFloat(c?.resources?.limits && c?.resources?.limits?.[`tencent.com/vcuda-memory`]) * 256) / 1024;
          this.gpuRequest =
            parseFloat((c?.resources?.requests && c?.resources?.requests?.[`tencent.com/vcuda-core`]) || 0) / 100;
          this.gpuMemoryRequest =
            (parseFloat((c?.resources?.requests && c?.resources?.requests?.[`tencent.com/vcuda-memory`]) || 0) * 256) /
            1024;
        });
      },
    },
  };
</script>
