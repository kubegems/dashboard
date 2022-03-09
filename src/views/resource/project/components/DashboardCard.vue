<template>
  <v-row>
    <v-col
      cols="3"
      class="py-0"
    >
      <BaseInfoCard
        :num="basic.environments"
        title="环境"
        icon="ion:cube"
      />
    </v-col>
    <v-col
      cols="3"
      class="py-0"
    >
      <BaseInfoCard
        :num="basic.applications"
        title="应用"
        icon="bi:app"
      />
    </v-col>
    <v-col
      cols="3"
      class="py-0"
    >
      <BaseInfoCard
        :num="basic.person"
        title="用户"
        icon="mdi:account"
      />
    </v-col>
    <v-col
      cols="3"
      class="py-0"
    >
      <BaseInfoCard
        :num="4"
        title="角色"
        icon="mdi:account-eye"
      />
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
}
</script>
