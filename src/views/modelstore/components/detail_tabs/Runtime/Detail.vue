<template>
  <div class="mt-3">
    <Card />

    <v-card>
      <BaseSubTitle class="pt-2" :divider="false" title="访问地址" />
    </v-card>

    <v-card class="mt-3">
      <BaseSubTitle class="pt-2" :divider="false" title="实例信息" />
      <PodList />
    </v-card>
  </div>
</template>

<script>
  import Card from './components/Card';
  import PodList from './components/PodList';

  export default {
    name: 'RuntimeDetail',
    components: {
      Card,
      PodList,
    },
  };
</script>
