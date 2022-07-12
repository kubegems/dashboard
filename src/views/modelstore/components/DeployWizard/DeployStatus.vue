<template>
  <v-card flat>
    <v-dialog v-if="deploying" hide-overlay light persistent :value="processing" width="300">
      <v-card class="pa-1" color="primary" flat>
        <v-card-text class="text-center white--text">
          部署中,请等待...
          <v-progress-linear class="mb-0 mt-2" color="white" indeterminate />
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
    props: {
      processing: {
        type: Boolean,
        default: () => false,
      },
    },
    data() {
      return {
        deploying: true,
      };
    },
    watch: {
      processing: {
        handler(newValue) {
          if (newValue) {
            const _v = this;
            setTimeout(() => {
              _v.deploying = false;
            }, 3000);
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      showDeployStatus() {
        this.$emit('showDeployStatus');
      },
    },
  };
</script>
