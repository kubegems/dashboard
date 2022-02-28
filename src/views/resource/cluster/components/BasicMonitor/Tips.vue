<template>
  <div class="d-flex">
    <v-menu
      open-on-hover
      max-height="400px"
      max-width="200px"
      offset-y
      bottom
      origin="top center"
      transition="scale-transition"
      :close-on-content-click="false"
    >
      <template #activator="{ on }">
        <!-- 暴露作用域插槽 -->
        <slot :on="on" />
      </template>
      <v-card>
        <v-list dense>
          <v-flex class="text-subtitle-2 text-center ma-2">
            <span>{{ title }}</span>
          </v-flex>
          <v-divider class="mx-2" />
          <v-list-item
            v-for="(msg, index) in item"
            :key="index"
          >
            <v-list-item-content class="text-body-2">
              {{ msg }}
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
export default {
  name: 'Tips',
  props: {
    title: {
      type: String,
      default: () => null,
    },
    item: {
      type: Array,
      default: () => null,
    },
  },
}
</script>

<style lang="scss" scoped>
.v-list-item__content {
  word-break: break-all;
}
</style>
