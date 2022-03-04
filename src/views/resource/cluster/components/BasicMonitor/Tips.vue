<template>
  <div class="d-flex">
    <v-menu
      open-on-hover
      bottom
      max-height="320px"
      max-width="200px"
      offset-y
      origin="top center"
      transition="scale-transition"
      :close-on-content-click="false"
      :close-delay="200"
    >
      <template #activator="{ on }">
        <!-- 暴露作用域插槽 -->
        <slot :on="on" />
      </template>
      <v-card flat>
        <v-list
          dense
          class="pa-0"
        >
          <v-flex class="text-body-2 text-center primary white--text py-2">
            <v-icon
              color="white"
              left
              small
            >
              mdi-alert
            </v-icon>
            <span>{{ title }}</span>
          </v-flex>
          <v-list-item>
            <v-list-item-content>
              <v-list-item
                v-for="(msg, index) in item"
                :key="index"
                two-line
                class="float-left pa-0"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title> 事件 {{ index + 1 }} </v-list-item-title>
                  <v-list-item-content class="text-caption kubegems__detail">
                    {{ msg }}
                  </v-list-item-content>
                </v-list-item-content>
              </v-list-item>
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
