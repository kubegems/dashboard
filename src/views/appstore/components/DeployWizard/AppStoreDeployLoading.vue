<template>
  <div class="text-center">
    <v-dialog hide-overlay light persistent :value="dialog" width="300">
      <v-card color="primary" dark>
        <v-card-text class="text-center">
          部署中,请等待...
          <v-progress-linear class="mb-0" color="white" indeterminate />
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
