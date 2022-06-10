<template>
  <v-list-item-content class="py-2">
    <v-list-item-subtitle class="text-body-2 py-0">
      <v-list-item two-line class="float-left pa-0 keyvalue__item">
        <v-list-item-content class="py-0">
          <v-list-item-title class="text-subtitle-2 py-1">
            <span> 键值对 </span>
          </v-list-item-title>
          <v-list-item-subtitle class="text-body-2 py-1"> 类型 </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item two-line class="float-left pa-0 keyvalue__item">
        <v-list-item-content class="py-0">
          <v-list-item-title class="text-subtitle-2 py-1">
            <span>
              {{ item.name }}
            </span>
          </v-list-item-title>
          <v-list-item-subtitle class="text-body-2 py-1"> 名称 </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item two-line class="float-left pa-0 keyvalue__item">
        <v-list-item-content class="py-0">
          <v-list-item-title class="text-subtitle-2 py-1">
            <span>
              {{ item.value }}
            </span>
          </v-list-item-title>
          <v-list-item-subtitle class="text-body-2 py-1"> 值 </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list-item-subtitle>
    <div class="kubegems__clear-float" />
  </v-list-item-content>
</template>

<script>
  export default {
    name: 'KeyValue',
    props: {
      item: {
        type: Object,
        default: () => {},
      },
    },
  };
</script>

<style lang="scss" scoped>
  .keyvalue__item {
    width: 200px;
    word-break: break-all;
    white-space: break-spaces;
  }
</style>
