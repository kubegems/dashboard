<template>
  <v-card class="mt-6">
    <v-card-text class="pa-0">
      <BaseSubTitle class="pt-2" :divider="false" title="资源统计" />
      <div class="kubegems__clear-float" />
      <v-row class="pa-3 mt-2">
        <v-col
          v-for="(key, index) in resources"
          :key="index"
          align="center"
          class="py-0 my-6"
          cols="2"
          justify="center"
        >
          <div class="d-flex align-center justify-center">
            <Icon class="mr-6 primary--text" height="40px" :icon="$RESOURCE_ICON[key]" width="40px" />
            <div class="mx-2 text-width">
              <h2 class="text-h5">
                {{ quota[key] }}
              </h2>
              <h5 class="text-subtitle-2 font-weight-regular">
                {{ $RESOURCE_CN[key] }}
              </h5>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'ResourceList',
    mixins: [BaseResource],
    props: {
      quota: {
        type: Object,
        default: () => {},
      },
      resources: {
        type: Array,
        default: () => [],
      },
    },
  };
</script>

<style lang="scss" scoped>
  .text-width {
    width: 100px;
  }
</style>
