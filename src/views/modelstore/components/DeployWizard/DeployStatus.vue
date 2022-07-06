<template>
  <v-card flat>
    <v-dialog v-if="deploying" hide-overlay light persistent :value="dialog" width="300">
      <v-card color="primary" dark>
        <v-card-text class="text-center">
          部署中,请等待...
          <v-progress-linear class="mb-0" color="white" indeterminate />
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-card-text v-else class="pa-5 text-center">
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
    name: 'DeployStatus',
    data() {
      return {
        deploying: true,
      };
    },
    methods: {
      showDeployStatus() {
        this.$emit('showDeployStatus');
      },
    },
  };
</script>
