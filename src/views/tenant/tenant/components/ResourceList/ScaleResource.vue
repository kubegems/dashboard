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
  <BaseDialog v-model="dialog" icon="mdi-scale" :title="$t('resource.tip.resource_scale')" :width="1000" @reset="reset">
    <template #content>
      <ResourceBaseForm ref="resource" :cluster="cluster" edit :quota="quota" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="updateTenantResourceQuota">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../i18n';
  import ResourceBaseForm from './ResourceBaseForm';
  import { putUpdateTenantResourceQuota } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'ScaleResource',
    i18n: {
      messages: messages,
    },
    components: {
      ResourceBaseForm,
    },
    mixins: [BaseResource],
    data: () => ({
      dialog: false,
      item: null,
      quota: null,
      cluster: '',
    }),
    computed: {
      ...mapState(['Circular']),
    },
    watch: {
      item: {
        handler(newValue) {
          if (newValue) {
            this.cluster = newValue?.Cluster?.ClusterName;
          }
        },
        deep: true,
      },
    },
    methods: {
      open() {
        this.dialog = true;
      },
      async updateTenantResourceQuota() {
        if (this.$refs.resource.validate()) {
          const data = deepCopy(this.$refs.resource.getData());
          data.Content['limits.memory'] = `${data.Content['limits.memory']}Gi`;
          data.Content[`requests.storage`] = `${data.Content[`requests.storage`]}Gi`;
          data.ClusterID = this.item.ClusterID;
          data.TenantID = this.item.TenantID;
          await putUpdateTenantResourceQuota(this.item.TenantID, this.item.ClusterID, data);
          this.reset();
          this.$emit('refresh');
        }
      },
      async init(item) {
        this.item = deepCopy(item);
        this.item.NowCpu = item.Cpu;
        this.item.NowMemory = item.Memory;
        this.item.NowStorage = item.Storage;
        if (item.NvidiaGpu) {
          this.item.NowNvidiaGpu = item.NvidiaGpu;
        }
        if (item.TkeGpu) {
          this.item.NowTkeGpu = item.TkeGpu;
        }
        if (item.TkeMemory) {
          this.item.NowTkeMemory = item.TkeMemory;
        }
        this.quota = await this.m_resource_clusterQuota(this.item.ClusterID, this.item);
        const content = {
          'limits.cpu': item.Cpu,
          'limits.memory': item.Memory,
          'requests.storage': item.Storage,
        };
        if (item.NvidiaGpu) {
          content['limits.nvidia.com/gpu'] = item.NvidiaGpu;
        }
        if (item.TkeGpu) {
          content['tencent.com/vcuda-core'] = item.TkeGpu;
        }
        if (item.TkeMemory) {
          content['tencent.com/vcuda-memory'] = item.TkeMemory;
        }
        this.$refs.resource.setContent(content);
      },
      reset() {
        this.dialog = false;
        this.$refs.resource.reset();
        this.quota = null;
      },
    },
  };
</script>
