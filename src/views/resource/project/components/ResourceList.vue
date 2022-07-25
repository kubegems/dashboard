<template>
  <v-card class="mt-6" flat>
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
            <v-btn class="elevation-0" color="primary" dark fab small>
              <v-icon>{{ $RESOURCE_ICON[key] }}</v-icon>
            </v-btn>
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
