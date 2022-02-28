<template>
  <v-container fluid>
    <v-card
      class="mt-8"
      height="400px"
    >
      <v-row class="row-height">
        <v-col class="d-none d-md-flex align-center justify-center">
          <div class="d-none d-sm-block">
            <div class="d-flex align-center pa-10">
              <div class="text-center">
                <h2 class="text-h4 primary--text font-weight-medium">
                  您访问的页面不存在
                </h2>
                <h6
                  class="
                    text-subtitle-1
                    mt-4
                    primary--text
                    op-5
                    font-weight-regular
                  "
                >
                  您可以从右上角工作台进入首页访问
                </h6>
                <v-btn
                  color="info mt-4"
                  @click="toDashboard"
                >
                  <v-icon
                    left
                    small
                  >
                    fas fa-undo-alt
                  </v-icon>
                  回到首页
                </v-btn>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'V404',
  computed: {
    ...mapGetters(['Tenant']),
  },
  methods: {
    toDashboard() {
      this.$store.commit('SET_ADMIN_VIEWPORT', false)
      this.$router.push({
        name: 'resource-dashboard',
        params: { tenant: this.Tenant().TenantName },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.row-height {
  height: 400px;
}
</style>
