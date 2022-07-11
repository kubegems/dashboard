<template>
  <v-simple-table class="mx-2 pa-2 pb-3">
    <template #default>
      <thead>
        <tr>
          <th class="text-left">容器组</th>
          <th class="text-left">状态</th>
          <th class="text-left">重启次数</th>
          <th class="text-left">age</th>
          <th class="text-left">pod ip</th>
          <th class="text-left">node</th>
          <th class="text-left">镜像版本</th>
        </tr>
      </thead>
      <tbody />
    </template>
  </v-simple-table>
</template>

<script>
  import { getModelRuntimePodList } from '@/api';

  export default {
    name: 'PodList',
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    watch: {
      item: {
        handler() {},
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async modelRuntimePodList() {
        await getModelRuntimePodList();
      },
    },
  };
</script>
