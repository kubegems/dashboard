<template>
  <v-simple-table class="mx-2 pa-2 pb-3">
    <template #default>
      <thead>
        <tr>
          <th class="text-left">卷名称</th>
          <th class="text-left">类型</th>
          <th class="text-left">键/路径</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in volumes" :key="item.name">
          <td>{{ item.name }}</td>
          <td>
            {{ getVolumeType(item) }}
          </td>
          <td>
            <template v-if="getVolumeType(item) !== 'emptyDir'">
              {{ getVolumeKey(item) }}
            </template>
          </td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script>
  export default {
    name: 'DetailVolume',
    props: {
      volumes: {
        type: Array,
        default: () => [],
      },
    },
    methods: {
      getVolumeType(item) {
        if (item.emptyDir) return 'emptyDir';
        if (item.hostPath) return 'hostPath';
        if (item.configMap) return 'configMap';
        if (item.secret) return 'secret';
        if (item.persistentVolumeClaim) return 'persistentVolumeClaim';
        if (item.projected) return 'projected';
      },
      getVolumeKey(item) {
        if (item.emptyDir) return '';
        if (item.hostPath) return item.hostPath.path;
        if (item.configMap) return item.configMap.name;
        if (item.secret) return item.secret.secretName;
        if (item.persistentVolumeClaim) return item.persistentVolumeClaim.name;
        if (item.projected) return '投射卷请从YAML中查看';
      },
    },
  };
</script>
