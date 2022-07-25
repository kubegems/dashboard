<template>
  <v-row>
    <v-col class="mb-2" cols="2">
      <BaseInfoCard icon="mdi-server" :num="statistics ? statistics['count.clusters'] : 0" title="集群" />
    </v-col>
    <v-col class="pb-0" cols="2">
      <BaseInfoCard icon="mdi-cube-outline" :num="statistics ? statistics['count.projects'] : 0" title="项目" />
    </v-col>
    <v-col class="pb-0" cols="2">
      <BaseInfoCard icon="mdi-cloud" :num="statistics ? statistics['count.environments'] : 0" title="环境" />
    </v-col>
    <v-col class="pb-0" cols="2">
      <BaseInfoCard
        icon="mdi-vector-arrange-above"
        :num="statistics ? statistics['count.workloads'] : 0"
        title="工作负载"
      />
    </v-col>
    <v-col class="pb-0" cols="2">
      <BaseInfoCard icon="mdi-cube" :num="statistics ? statistics['count.pods'] : 0" title="容器组" />
    </v-col>
    <v-col class="pb-0" cols="2">
      <BaseInfoCard icon="mdi-account" :num="statistics ? statistics['count.users'] : 0" title="用户" />
    </v-col>
  </v-row>
</template>

<script>
  export default {
    name: 'DashboardCard',
    props: {
      statistics: {
        type: Object,
        default: () => null,
      },
    },
  };
</script>
