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
                  您暂时不属于任何租户！
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
                  您可以联系某个租户的管理员邀请您加入租户中或者创建新的租户
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
  name: 'WhitePage',
}
</script>

<style lang="scss" scoped>
.row-height {
  height: 400px;
}
</style>
