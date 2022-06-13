<template>
  <v-list-item-content class="py-2">
    <v-list-item-subtitle class="text-body-2 py-0">
      <v-list-item class="float-left pa-0 configmap__item" two-line>
        <v-list-item-content class="py-0">
          <v-list-item-title class="text-subtitle-2 py-1">
            <span> 配置 </span>
          </v-list-item-title>
          <v-list-item-subtitle class="text-body-2 py-1"> 类型 </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item class="float-left pa-0 configmap__item" two-line>
        <v-list-item-content class="py-0">
          <v-list-item-title class="text-subtitle-2 py-1">
            <span>
              {{ item.name }}
            </span>
          </v-list-item-title>
          <v-list-item-subtitle class="text-body-2 py-1"> 名称 </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item class="float-left pa-0 configmap__item" two-line>
        <v-list-item-content class="py-0">
          <v-list-item-title class="text-subtitle-2 py-1">
            <span>
              {{ item.valueFrom.configMapKeyRef.name }}
            </span>
          </v-list-item-title>
          <v-list-item-subtitle class="text-body-2 py-1"> 密钥 </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item class="float-left pa-0 configmap__item" two-line>
        <v-list-item-content class="py-0">
          <v-list-item-title class="text-subtitle-2 py-1">
            <span>
              {{ item.valueFrom.configMapKeyRef.key }}
            </span>
          </v-list-item-title>
          <v-list-item-subtitle class="text-body-2 py-1"> 键 </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list-item-subtitle>
    <div class="kubegems__clear-float" />
  </v-list-item-content>
</template>

<script>
  export default {
    name: 'Configmap',
    props: {
      item: {
        type: Object,
        default: () => {},
      },
    },
  };
</script>

<style lang="scss" scoped>
  .configmap__item {
    width: 200px;
    word-break: break-all;
    white-space: break-spaces;
  }
</style>
