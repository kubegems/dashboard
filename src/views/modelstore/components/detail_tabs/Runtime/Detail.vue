<template>
  <div class="mt-3">
    <Card />

    <v-card>
      <BaseSubTitle class="pt-2" :divider="false" title="访问地址" />
      <BaseListItemForDetail title="API地址">
        <template #content> aaaaaaas </template>
      </BaseListItemForDetail>

      <BaseListItemForDetail title="内部地址">
        <template #content> aaaaaaas </template>
      </BaseListItemForDetail>

      <BaseListItemForDetail title="端口">
        <template #content> aaaaaaas </template>
      </BaseListItemForDetail>
    </v-card>

    <v-card class="mt-3">
      <BaseSubTitle class="pt-2" :divider="false" title="实例信息" />
      <PodList :item="item" />
    </v-card>
  </div>
</template>

<script>
  import Card from './components/Card';
  import PodList from './components/PodList';
  import { getModelRuntimeDetail } from '@/api';

  export default {
    name: 'RuntimeDetail',
    components: {
      Card,
      PodList,
    },
    data() {
      return {
        item: null,
      };
    },
    mounted() {
      this.$nextTick(() => {
        this.modelRuntimeDetail();
      });
    },
    methods: {
      async modelRuntimeDetail() {
        const data = await getModelRuntimeDetail();
        this.item = data;
      },
    },
  };
</script>
