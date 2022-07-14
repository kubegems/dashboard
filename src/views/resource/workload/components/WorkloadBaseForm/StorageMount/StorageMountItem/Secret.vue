<template>
  <v-flex class="float-left">
    <v-list-item class="float-left px-0" :style="{ width: `296px` }" two-line>
      <v-list-item-content class="py-0">
        <v-list-item-title class="text-subtitle-2 py-1"> 密钥 </v-list-item-title>
        <v-list-item-subtitle class="text-body-2 py-1"> 类型 </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item class="float-left px-0" :style="{ width: `300px` }" two-line>
      <v-list-item-content class="py-0">
        <v-list-item-title class="text-subtitle-2 py-1"> {{ item.secret.secretName }}&nbsp; </v-list-item-title>
        <v-list-item-subtitle class="text-body-2 py-1"> 密钥 </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-flex>
</template>

<script>
  export default {
    name: 'Secret',
    props: {
      item: {
        type: Object,
        default: () => {},
      },
    },
  };
</script>
