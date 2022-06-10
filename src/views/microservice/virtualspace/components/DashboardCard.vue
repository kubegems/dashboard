<template>
  <v-row>
    <v-col cols="6" class="py-0">
      <BaseInfoCard
        :num="virtualspace && virtualspace.Environments ? virtualspace.Environments.length : 0"
        title="环境"
        icon="ion:cube"
      />
    </v-col>
    <!-- <v-col cols="4" class="py-0">
      <BaseInfoCard :num="0" title="应用" icon="bi:app" />
    </v-col> -->
    <v-col cols="6" class="py-0">
      <BaseInfoCard
        :num="virtualspace && virtualspace.Users ? virtualspace.Users.length : 0"
        title="成员"
        icon="mdi:account"
      />
    </v-col>
  </v-row>
</template>

<script>
  export default {
    name: 'DashboardCard',
    props: {
      virtualspace: {
        type: Object,
        default: () => {
          return {
            Users: [],
            Environments: [],
          };
        },
      },
    },
  };
</script>
