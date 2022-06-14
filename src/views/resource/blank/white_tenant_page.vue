<template>
  <v-container fluid>
    <v-card class="mt-8" height="400px">
      <v-row class="row-height">
        <v-col class="d-none d-md-flex align-center justify-center">
          <div class="d-none d-sm-block">
            <div class="d-flex align-center pa-10">
              <div class="text-center">
                <h2 class="text-h4 primary--text font-weight-medium"> 您已退出当前租户，请重新选择租户！ </h2>
                <h6 class="text-subtitle-1 mt-4 primary--text op-5 font-weight-regular">
                  您可以联系租户的管理员邀请您重新加入租户中
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
    name: 'WhiteTenantPage',
  };
</script>

<style lang="scss" scoped>
  .row-height {
    height: 400px;
  }
</style>
