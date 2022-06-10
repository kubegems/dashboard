<template>
  <v-flex class="float-left">
    <v-list-item two-line class="float-left px-0" style="width: 296px">
      <v-list-item-content class="py-0">
        <v-list-item-title class="text-subtitle-2 py-1">
          {{
            pvcs && pvcs[item.persistentVolumeClaim.claimName]
              ? pvcs[item.persistentVolumeClaim.claimName].spec.storageClassName
              : '未知'
          }}&nbsp;
        </v-list-item-title>
        <v-list-item-subtitle class="text-body-2 py-1"> 类型 </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item two-line class="float-left px-0" style="width: 150px">
      <v-list-item-content class="py-0">
        <v-list-item-title class="text-subtitle-2 py-1">
          {{
            pvcs[item.persistentVolumeClaim.claimName]
              ? pvcs[item.persistentVolumeClaim.claimName].spec.resources.requests.storage
              : '0Gi'
          }}&nbsp;
        </v-list-item-title>
        <v-list-item-subtitle class="text-body-2 py-1"> 容量 </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item two-line class="float-left px-0" style="width: 150px">
      <v-list-item-content class="py-0">
        <v-list-item-title class="text-subtitle-2 py-1">
          {{
            pvcs && pvcs[item.persistentVolumeClaim.claimName]
              ? pvcs[item.persistentVolumeClaim.claimName].spec.accessModes[0]
              : '未知'
          }}&nbsp;
        </v-list-item-title>
        <v-list-item-subtitle class="text-body-2 py-1"> 访问模式 </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item two-line class="float-left px-0" style="width: 250px">
      <v-list-item-content class="py-0">
        <v-list-item-title class="text-subtitle-2 py-1">
          {{
            pvcs && pvcs[item.persistentVolumeClaim.claimName]
              ? pvcs[item.persistentVolumeClaim.claimName].metadata.name
              : '未知'
          }}&nbsp;
        </v-list-item-title>
        <v-list-item-subtitle class="text-body-2 py-1"> 存储卷 </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-flex>
</template>

<script>
  export default {
    name: 'PersistentVolumeClaim',
    props: {
      item: {
        type: Object,
        default: () => {},
      },
      pvcs: {
        type: Object,
        default: () => {},
      },
    },
  };
</script>
