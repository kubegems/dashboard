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
                  您的租户暂未分配任何集群资源
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
                  您可以联系系统管理员为您所在的租户分配集群资源
                </h6>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'WhiteClusterPage',
}
</script>

<style lang="scss" scoped>
.row-height {
  height: 400px;
}
</style>
