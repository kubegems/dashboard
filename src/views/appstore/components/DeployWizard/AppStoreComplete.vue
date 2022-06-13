<template>
  <v-card flat>
    <v-card-text class="pa-5 text-center">
      <Icon class="ml-0 success--text" height="100px" icon="el:ok-sign" width="100px" />
      <h4 class="text-h6 mt-3 mb-8">部署成功</h4>
      <div class="mt-3">
        <v-btn color="primary" small text @click="showDeployStatus"> 查看部署状态 </v-btn>
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
