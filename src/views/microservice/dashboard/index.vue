<template>
  <v-container fluid>
    <BaseBreadcrumb :breadcrumb="breadcrumb" />
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'Dashboard',
  data: () => ({
    breadcrumb: {
      title: '服务治理',
      tip: '租户容器服务提供了安全隔离的、具有访问权限控制的工作平台。这里您可以看到当前租户内资源运行的概况。',
      icon: 'mdi-google-circles-extended',
    },
  }),
  computed: {
    ...mapState(['JWT']),
    ...mapGetters(['VirtualSpace']),
  },
  mounted() {
    if (this.JWT) {
      if (this.VirtualSpace().ID > 0) {
        this.$router.replace({
          name: 'virtualspace-detail',
        })
      }
    }
  },
}
</script>
