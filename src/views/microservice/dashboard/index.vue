<template>
  <v-container fluid>
    <BaseBreadcrumb />
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'Dashboard',
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
