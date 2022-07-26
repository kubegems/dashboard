<template>
  <v-row>
    <v-col class="py-0 mb-3" cols="3">
      <BaseInfoCard
        icon="mdi-cpu-64-bit"
        :large="false"
        :num="item ? item.spec.resources.limits.cpu : 0"
        title="已分配CPU"
      />
    </v-col>
    <v-col class="py-0 mb-3" cols="3">
      <BaseInfoCard
        icon="mdi-nas"
        :large="false"
        :num="item ? item.spec.resources.limits.memory : 0"
        title="已分配内存"
      />
    </v-col>
    <v-col class="py-0 mb-3" cols="3">
      <BaseInfoCard icon="mdi-memory" :large="false" :num="gpu ? gpu : '未分配'" title="已分配GPU" />
    </v-col>
    <v-col class="py-0 mb-3" cols="3">
      <BaseInfoCard icon="mdi-nas" :large="false" :num="gpuStorage ? gpuStorage : '未分配'" title="已分配显存" />
    </v-col>
  </v-row>
</template>

<script>
  export default {
    name: 'DashboardCard',
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
            if (newValue?.spec?.resources?.limits?.[`limits.nvidia.com/gpu`]) {
              this.gpu = parseFloat(newValue?.spec?.resources?.limits?.[`limits.nvidia.com/gpu`]);
            }
            if (newValue?.spec?.resources?.limits?.[`tencent.com/vcuda-core`]) {
              this.gpu += parseFloat(newValue?.spec?.resources?.limits?.[`tencent.com/vcuda-core`]) / 100;
            }
            if (newValue?.spec?.resources?.limits?.[`tencent.com/vcuda-memory`]) {
              this.gpuStorage =
                (parseFloat(newValue?.spec?.resources?.limits?.[`tencent.com/vcuda-memory`]) * 256) / 1024;
            }
          }
        },
        deep: true,
        immediate: true,
      },
    },
  };
</script>
