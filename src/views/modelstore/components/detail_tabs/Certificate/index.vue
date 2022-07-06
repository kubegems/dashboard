<template>
  <div class="mt-3 white rounded pa-4 certificate">
    <div class="license">
      License授权
      <v-icon color="success" right small>mdi-check-circle</v-icon>
      <span class="license__expired">有效期至 2022/12/22 12:12:12</span>
    </div>

    <v-flex class="kubegems__top-right mt-3">
      <v-menu left>
        <template #activator="{ on }">
          <v-btn icon>
            <v-icon color="primary" x-small v-on="on"> fas fa-ellipsis-v </v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-card-text class="pa-2 text-center">
            <v-flex>
              <v-btn color="primary" small text> 编辑 </v-btn>
            </v-flex>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-flex>
  </div>
</template>

<script>
  export default {
    name: 'Certificate',
  };
</script>

<style lang="scss" scoped>
  .certificate {
    position: relative;
  }

  .license {
    line-height: 30px;

    &__expired {
      font-size: 13px;
    }
  }
</style>
