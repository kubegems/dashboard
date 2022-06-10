<template>
  <div class="text-center">
    <v-dialog :value="dialog" hide-overlay persistent width="300" light>
      <v-card color="primary" dark>
        <v-card-text class="text-center">
          部署中,请等待...
          <v-progress-linear indeterminate color="white" class="mb-0" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  export default {
    name: 'AppStoreDeployLoading',
    props: {
      dialog: {
        type: Boolean,
        default: () => false,
      },
    },
  };
</script>
