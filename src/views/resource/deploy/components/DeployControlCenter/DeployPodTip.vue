<template>
  <v-flex>
    <BaseTipWindow v-for="(pod, index) in pods" :key="index" top icon="mdi-cube" title="容器组" :max-width="180">
      <template #header>
        <v-icon v-if="pod.status === 'Running'" :color="getColor(pod.ready)" class="mx-0-5 icon-font">
          mdi-cube
        </v-icon>
        <v-icon
          v-else-if="
            ['ContainerCreating', 'Pending', 'PodInitializing', 'Terminating'].indexOf(pod.status) > -1 ||
            pod.status.indexOf('Init') > -1
          "
          color="warning"
          class="mx-0-5 icon-font waiting-circle-flashing"
        >
          mdi-autorenew
        </v-icon>
        <v-icon v-else-if="['Completed', 'Evicted'].indexOf(pod.status) > -1" color="grey" class="mx-0-5 icon-font">
          mdi-alert-box
        </v-icon>
        <v-icon v-else color="error" class="mx-0-5 icon-font"> mdi-close-box </v-icon>
      </template>
      <template #content>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>名称</v-list-item-title>
            <v-list-item-content class="text-caption kubegems__text">
              {{ pod.objectMeta.name }}
            </v-list-item-content>
            <v-list-item-title>状态</v-list-item-title>
            <v-list-item-content class="text-caption kubegems__text">
              {{ pod.status }}
            </v-list-item-content>
            <v-list-item-title>容器</v-list-item-title>
            <v-list-item-content class="text-caption kubegems__text my-0">
              {{ pod.ready }}
            </v-list-item-content>
          </v-list-item-content>
        </v-list-item>
      </template>
    </BaseTipWindow>
  </v-flex>
</template>

<script>
  export default {
    name: 'DeployPodTip',
    props: {
      pods: {
        type: Array,
        default: () => [],
      },
    },
    methods: {
      getColor(status) {
        if (status) {
          const s = status.split('/');
          if (s.length === 2) {
            if (parseInt(s[0]) === parseInt(s[1])) {
              return 'success';
            } else {
              return 'warning';
            }
          }
          return 'success';
        }
        return 'success';
      },
    },
  };
</script>
