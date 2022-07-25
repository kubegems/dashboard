<template>
  <v-row>
    <v-col class="py-0 mb-3" cols="3">
      <BaseInfoCard icon="mdi-cpu-64-bit" :num="11111" title="已分配CPU" />
    </v-col>
    <v-col class="py-0 mb-3" cols="3">
      <BaseInfoCard icon="mdi-nas" :num="11111" title="已分配内存" />
    </v-col>
    <v-col class="py-0 mb-3" cols="3">
      <BaseInfoCard icon="mdi-memory" :num="11111" title="已分配GPU" />
    </v-col>
    <v-col class="py-0 mb-3" cols="3">
      <BaseInfoCard icon="mdi-nas" :num="11111" title="已分配显存" />
    </v-col>
  </v-row>
</template>

<script>
  export default {
    name: 'DashboardCard',
  };
</script>
