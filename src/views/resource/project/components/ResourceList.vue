<template>
  <v-card class="mt-6">
    <v-card-text class="pa-0">
      <BaseSubTitle
        class="pt-2"
        title="资源统计"
        :divider="false"
      />
      <div class="kubegems__clear-float" />
      <v-row class="pa-3 mt-2">
        <v-col
          v-for="(key, index) in resources"
          :key="index"
          cols="2"
          class="py-0 my-6"
          justify="center"
          align="center"
        >
          <div class="d-flex align-center justify-center">
            <Icon
              :icon="$RESOURCE_ICON[key]"
              class="mr-6 primary--text"
              width="40px"
              height="40px"
            />
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
import BaseResource from '@/mixins/resource'

export default {
  name: 'ResourceList',
  mixins: [BaseResource],
  props: {
    resources: {
      type: Array,
      default: () => [],
    },
    quota: {
      type: Object,
      default: () => {},
    },
  },
}
</script>

<style lang="scss" scoped>
.text-width {
  width: 100px;
}
</style>
