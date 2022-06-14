<template>
  <v-flex>
    <v-sheet v-for="(item, index) in volumes" :key="index" class="grey lighten-4 rounded mb-3">
      <v-list-item two-line>
        <v-list-item-content class="py-0">
          <v-list-item-subtitle class="text-subtitle-2 py-1 primary--text">
            <v-flex>
              <v-list-item class="pl-0 list-item-height" two-line>
                <v-list-item-title class="text-subtitle-1 py-1 primary--text font-weight-medium">
                  <v-menu :close-delay="200" open-on-hover top>
                    <template #activator="{ on }">
                      <span v-on="on">{{ item.name }}</span>
                    </template>
                    <v-card>
                      <v-card-text class="pa-2">
                        {{ item.name }}
                      </v-card-text>
                    </v-card>
                  </v-menu>
                </v-list-item-title>
              </v-list-item>
            </v-flex>

            <PersistentVolumeClaim v-if="item.persistentVolumeClaim" :item="item" :pvcs="pvcs" />

            <Configmap v-else-if="item.configMap" :item="item" />

            <Secret v-else-if="item.secret" :item="item" />

            <HostPath v-else-if="item.hostPath" :item="item" />

            <EmptyDir v-else-if="item.emptyDir" />

            <div class="kubegems__clear-float" />
          </v-list-item-subtitle>
          <v-list-item-content v-for="(container, i) in containers" :key="`container${i}`" class="pb-4">
            <v-row v-if="container.volumeMounts && containerMap[container.name][item.name]">
              <v-col class="py-1" :cols="containerMap[container.name][item.name].subPath ? 3 : 4">
                <span class="text-body-2">容器:</span>
                <span class="text-subtitle-2 ml-2">
                  {{ container.name }}
                </span>
              </v-col>
              <v-col class="py-1" cols="5">
                <span class="text-body-2">挂载:</span>
                <span class="text-subtitle-2 ml-2">
                  {{ containerMap[container.name][item.name].mountPath }}
                </span>
                <span class="text-subtitle-2 ml-2">
                  ({{ containerMap[container.name][item.name].readOnly ? '只读' : '读写' }})
                </span>
              </v-col>
              <v-col v-if="containerMap[container.name][item.name].subPath" class="py-1" cols="3">
                <span class="text-body-2">子路径:</span>
                <span class="text-subtitle-2 ml-2">
                  {{ containerMap[container.name][item.name].subPath }}
                </span>
              </v-col>
            </v-row>
            <v-row v-else>
              <v-col class="py-1" cols="4">
                <span class="text-body-2">容器:</span>
                <span class="text-subtitle-2 ml-2">
                  {{ container.name }}
                </span>
              </v-col>
              <v-col class="py-1" cols="5">
                <span class="text-body-2">挂载:</span>
                <span class="text-subtitle-2 ml-2">不挂载</span>
              </v-col>
            </v-row>
          </v-list-item-content>
          <template v-if="initContainers">
            <v-list-item-content v-for="(container, i) in initContainers" :key="`initcontainer${i}`" class="pb-4">
              <v-row v-if="container.volumeMounts && initContainerMap[container.name][item.name]">
                <v-col class="py-1" :cols="initContainerMap[container.name][item.name].subPath ? 3 : 4">
                  <span class="text-body-2">容器:</span>
                  <span class="text-subtitle-2 ml-2"> {{ container.name }}(init) </span>
                </v-col>
                <v-col class="py-1" cols="5">
                  <span class="text-body-2">挂载:</span>
                  <span class="text-subtitle-2 ml-2">
                    {{ initContainerMap[container.name][item.name].mountPath }}
                  </span>
                  <span class="text-subtitle-2 ml-2">
                    ({{ initContainerMap[container.name][item.name].readOnly ? '只读' : '读写' }})
                  </span>
                </v-col>
                <v-col v-if="initContainerMap[container.name][item.name].subPath" class="py-1" cols="3">
                  <span class="text-body-2">子路径:</span>
                  <span class="text-subtitle-2 ml-2">
                    {{ initContainerMap[container.name][item.name].subPath }}
                  </span>
                </v-col>
              </v-row>
              <v-row v-else>
                <v-col class="py-1" cols="4">
                  <span class="text-body-2">容器:</span>
                  <span class="text-subtitle-2 ml-2"> {{ container.name }}(init) </span>
                </v-col>
                <v-col class="py-1" cols="5">
                  <span class="text-body-2">挂载:</span>
                  <span class="text-subtitle-2 ml-2">不挂载</span>
                </v-col>
              </v-row>
            </v-list-item-content>
          </template>
        </v-list-item-content>
        <v-btn color="primary" dark fab right text x-small @click="updateData(index)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn color="error" dark fab right text x-small @click="removeData(index)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>
    <v-flex class="grey lighten-4 rounded">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0 text-center">
            <v-btn color="primary" text @click="expandCard">
              <v-icon left small> mdi-plus </v-icon>
              添加卷挂载
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-flex>
</template>

<script>
  import Configmap from './Configmap';
  import EmptyDir from './EmptyDir';
  import HostPath from './HostPath';
  import PersistentVolumeClaim from './PersistentVolumeClaim';
  import Secret from './Secret';

  import BaseResource from '@/mixins/resource';

  export default {
    name: 'StorageMountItem',
    components: {
      Configmap,
      EmptyDir,
      HostPath,
      PersistentVolumeClaim,
      Secret,
    },
    mixins: [BaseResource],
    props: {
      containers: {
        type: Array,
        default: () => [],
      },
      initContainers: {
        type: Array,
        default: () => [],
      },
      pvcs: {
        type: Object,
        default: () => {},
      },
      volumes: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        containerMap: {},
        initContainerMap: {},
      };
    },
    watch: {
      containers() {
        this.containers.forEach((c) => {
          this.containerMap[c.name] = {};
          if (c.volumeMounts) {
            c.volumeMounts.forEach((v) => {
              this.containerMap[c.name][v.name] = v;
            });
          }
        });
      },
      initContainers() {
        this.initContainers.forEach((c) => {
          this.initContainerMap[c.name] = {};
          if (c.volumeMounts) {
            c.volumeMounts.forEach((v) => {
              this.initContainerMap[c.name][v.name] = v;
            });
          }
        });
      },
    },
    methods: {
      updateData(index) {
        this.$emit('updateData', index);
      },
      removeData(index) {
        this.$emit('removeData', index);
      },
      expandCard() {
        this.$emit('expandCard');
      },
    },
  };
</script>

<style lang="scss" scoped>
  .list-item-height {
    min-height: 20px !important;
  }
</style>
