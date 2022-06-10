<template>
  <v-card flat>
    <v-card-text class="pa-5 text-center">
      <Icon icon="el:ok-sign" width="100px" height="100px" class="ml-0 success--text" />
      <h4 class="text-h6 mt-3 mb-8">部署成功</h4>
      <div class="mt-3">
        <v-btn small color="primary" text @click="showDeployStatus"> 查看部署状态 </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
  export default {
    name: 'AppStoreComplete',
    methods: {
      showDeployStatus() {
        this.$emit('showDeployStatus');
      },
    },
  };
</script>
