<template>
  <div class="d-flex">
    <v-menu
      bottom
      :close-delay="200"
      :close-on-content-click="false"
      max-width="200px"
      offset-y
      open-on-hover
      origin="top center"
      transition="scale-transition"
    >
      <template #activator="{ on }">
        <!-- 暴露作用域插槽 -->
        <slot :on="on" />
      </template>
      <v-card flat>
        <v-flex class="text-body-2 text-center primary white--text py-2">
          <v-icon color="white" left small> mdi-alert </v-icon>
          <span>{{ title }}</span>
        </v-flex>
        <v-list class="pa-0 kubegems__tip" dense>
          <v-list-item>
            <v-list-item-content>
              <v-list-item v-for="(msg, index) in item" :key="index" class="float-left pa-0" two-line>
                <v-list-item-content class="py-0">
                  <v-list-item-title> 事件 {{ index + 1 }} </v-list-item-title>
                  <v-list-item-content class="text-caption kubegems__text">
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
      item: {
        type: Array,
        default: () => null,
      },
      title: {
        type: String,
        default: () => null,
      },
    },
  };
</script>

<style lang="scss" scoped>
  .v-list-item__content {
    word-break: break-all;
  }
</style>
