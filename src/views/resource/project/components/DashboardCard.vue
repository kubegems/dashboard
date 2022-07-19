<template>
  <v-row>
    <v-col class="py-0" cols="3">
      <BaseInfoCard icon="mdi:cube-scan" :num="basic.environments" title="环境" />
    </v-col>
    <v-col class="py-0" cols="3">
      <BaseInfoCard icon="mdi:apps" :num="basic.applications" title="应用" />
    </v-col>
    <v-col class="py-0" cols="3">
      <BaseInfoCard icon="mdi:account" :num="basic.person" title="用户" />
    </v-col>
    <v-col class="py-0" cols="3">
      <BaseInfoCard icon="mdi:account-eye" :num="4" title="角色" />
    </v-col>
  </v-row>
</template>

<script>
  export default {
    name: 'DashboardCard',
    props: {
      basic: {
        type: Object,
        default: () => null,
      },
    },
  };
</script>
