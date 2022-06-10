<template>
  <v-card flat height="55%" class="rounded-t-0">
    <v-card-text class="d-flex pl-6 align-center flex-wrap" style="height: 100%">
      <div class="d-flex align-center justify-start my-2" style="width: 50%">
        <Icon :icon="$RESOURCE_ICON['node']" class="mr-4 icon-large primary--text" :width="35" />
        <h6 class="text-large-size font-weight-regular">
          节点 {{ workload && workload['node'] ? workload['node'] : '' }}
        </h6>
      </div>
      <div class="d-flex align-center justify-start my-2" style="width: 50%">
        <Icon :icon="$RESOURCE_ICON['cpu']" class="mr-4 icon-large primary--text" :width="35" />
        <div>
          <h5 class="text-size font-weight-regular">
            物理CPU
            {{ quota ? sizeOfCpu(quota.capacity.cpu).toFixed(1) : 0 }}
            core（1:{{ cluster ? cluster.OversoldConfig.cpu : 1 }}）
          </h5>
          <h5 class="text-size font-weight-regular">
            vCPU
            {{ quota && cluster ? (sizeOfCpu(quota.capacity.cpu) * cluster.OversoldConfig.cpu).toFixed(1) : 0 }}
            core
          </h5>
        </div>
      </div>
      <div class="d-flex align-center justify-start my-2" style="width: 50%">
        <Icon :icon="$RESOURCE_ICON['storage']" class="mr-4 icon-large primary--text" :width="35" />
        <div>
          <h5 class="text-size font-weight-regular">
            物理存储
            {{ quota ? sizeOfStorage(quota.capacity['ephemeral-storage']).toFixed(1) : 0 }}
            Gi（1:{{ cluster ? cluster.OversoldConfig.storage : 1 }}）
          </h5>
          <h5 class="text-size font-weight-regular">
            v存储
            {{
              quota && cluster
                ? (sizeOfStorage(quota.capacity['ephemeral-storage']) * cluster.OversoldConfig.storage).toFixed(1)
                : 0
            }}
            Gi
          </h5>
        </div>
      </div>
      <div class="d-flex align-center justify-start my-2" style="width: 50%">
        <Icon :icon="$RESOURCE_ICON['memory']" class="mr-4 icon-large primary--text" :width="35" />
        <div>
          <h5 class="text-size font-weight-regular">
            物理内存
            {{ quota ? sizeOfStorage(quota.capacity.memory).toFixed(1) : 0 }}
            Gi （1:{{ cluster ? cluster.OversoldConfig.memory : 1 }}）
          </h5>
          <h5 class="text-size font-weight-regular">
            v内存
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
  import BaseResource from '@/mixins/resource';
  import { sizeOfCpu, sizeOfStorage } from '@/utils/helpers';

  export default {
    name: 'ResourceInfo',
    mixins: [BaseResource],
    props: {
      quota: {
        type: Object,
        default: () => null,
      },
      workload: {
        type: Object,
        default: () => null,
      },
      cluster: {
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
