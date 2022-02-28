<template>
  <v-flex>
    <v-sheet
      v-for="(item, index) in volumes"
      :key="index"
      class="grey lighten-4 rounded mb-2"
    >
      <v-list-item two-line>
        <v-list-item-content class="py-0">
          <v-list-item-subtitle class="text-subtitle-2 py-1 primary--text">
            <v-flex class="float-left kubegems__mount-width">
              <v-list-item
                two-line
                class="pl-0"
              >
                <v-list-item-title
                  class="text-subtitle-1 py-1 primary--text font-weight-medium"
                >
                  <v-menu
                    top
                    open-on-hover
                    :close-delay="200"
                  >
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
            <v-flex
              v-if="item.persistentVolumeClaim"
              class="float-left"
            >
              <v-list-item
                two-line
                class="float-left"
                style="width: 150px;"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1">
                    {{
                      pvcs && pvcs[item.persistentVolumeClaim.claimName]
                        ? pvcs[item.persistentVolumeClaim.claimName].spec
                          .storageClassName
                        : '未知'
                    }}&nbsp;
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    类型
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                two-line
                class="float-left"
                style="width: 150px;"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1">
                    {{
                      pvcs[item.persistentVolumeClaim.claimName]
                        ? pvcs[item.persistentVolumeClaim.claimName].spec
                          .resources.requests.storage
                        : '0Gi'
                    }}&nbsp;
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    容量
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                two-line
                class="float-left"
                style="width: 200px;"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1">
                    {{
                      pvcs && pvcs[item.persistentVolumeClaim.claimName]
                        ? pvcs[item.persistentVolumeClaim.claimName].spec
                          .accessModes[0]
                        : '未知'
                    }}&nbsp;
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    访问模式
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                two-line
                class="float-left"
                style="width: 250px;"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1">
                    {{
                      pvcs && pvcs[item.persistentVolumeClaim.claimName]
                        ? pvcs[item.persistentVolumeClaim.claimName].metadata
                          .name
                        : '未知'
                    }}&nbsp;
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    存储卷
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-flex>
            <v-flex
              v-else-if="item.configMap"
              class="float-left"
            >
              <v-list-item
                two-line
                class="float-left"
                style="width: 150px;"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1">
                    配置
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    类型
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                two-line
                class="float-left"
                style="width: 300px;"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1">
                    {{ item.configMap.name }}&nbsp;
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    配置
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-flex>
            <v-flex
              v-else-if="item.secret"
              class="float-left"
            >
              <v-list-item
                two-line
                class="float-left"
                style="width: 150px;"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1">
                    密钥
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    类型
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                two-line
                class="float-left"
                style="width: 300px;"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1">
                    {{ item.secret.secretName }}&nbsp;
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    密钥
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-flex>
            <v-flex
              v-else-if="item.hostPath"
              class="float-left"
            >
              <v-list-item
                two-line
                class="float-left"
                style="width: 150px;"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1">
                    hostPath
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    类型
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                two-line
                class="float-left"
                style="width: 300px;"
              >
                <v-list-item-content class="py-0">
                  <v-list-item-title class="text-subtitle-2 py-1">
                    {{ item.hostPath.path }}&nbsp;
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2 py-1">
                    路径
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-flex>
            <div class="kubegems__clear-float" />
          </v-list-item-subtitle>
          <v-list-item-content
            v-for="(container, i) in containers"
            :key="`container${i}`"
            class="pb-4"
          >
            <v-row
              v-if="
                container.volumeMounts &&
                  containerMap[container.name][item.name]
              "
            >
              <v-col
                :cols="containerMap[container.name][item.name].subPath ? 3 : 4"
                class="py-1"
              >
                <span class="text-body-2">容器:</span>
                <span class="text-subtitle-2 ml-2">
                  {{ container.name }}
                </span>
              </v-col>
              <v-col
                cols="5"
                class="py-1"
              >
                <span class="text-body-2">挂载:</span>
                <span class="text-subtitle-2 ml-2">
                  {{ containerMap[container.name][item.name].mountPath }}
                </span>
                <span class="text-subtitle-2 ml-2">
                  ({{
                    containerMap[container.name][item.name].readOnly
                      ? '只读'
                      : '读写'
                  }})
                </span>
              </v-col>
              <v-col
                v-if="containerMap[container.name][item.name].subPath"
                cols="3"
                class="py-1"
              >
                <span class="text-body-2">子路径:</span>
                <span class="text-subtitle-2 ml-2">
                  {{ containerMap[container.name][item.name].subPath }}
                </span>
              </v-col>
            </v-row>
            <v-row v-else>
              <v-col
                cols="4"
                class="py-1"
              >
                <span class="text-body-2">容器:</span>
                <span class="text-subtitle-2 ml-2">
                  {{ container.name }}
                </span>
              </v-col>
              <v-col
                cols="5"
                class="py-1"
              >
                <span class="text-body-2">挂载:</span>
                <span class="text-subtitle-2 ml-2">不挂载</span>
              </v-col>
            </v-row>
          </v-list-item-content>
        </v-list-item-content>
        <v-btn
          dark
          text
          fab
          right
          x-small
          color="primary"
          @click="updateData(index)"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          dark
          text
          fab
          right
          x-small
          color="error"
          @click="removeData(index)"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>
    <v-flex class="grey lighten-4 rounded-0">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0 text-center">
            <v-btn
              text
              color="primary"
              @click="expandCard"
            >
              <v-icon
                left
                small
              >
                mdi-plus
              </v-icon>
              添加卷挂载
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-flex>
</template>

<script>
import BaseResource from '@/mixins/resource'

export default {
  name: 'StorageMountItem',
  mixins: [BaseResource],
  props: {
    volumes: {
      type: Array,
      default: () => [],
    },
    containers: {
      type: Array,
      default: () => [],
    },
    pvcs: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      containerMap: {},
    }
  },
  watch: {
    containers() {
      this.containers.forEach((c) => {
        this.containerMap[c.name] = {}
        if (c.volumeMounts) {
          c.volumeMounts.forEach((v) => {
            this.containerMap[c.name][v.name] = v
          })
        }
      })
    },
  },
  methods: {
    updateData(index) {
      this.$emit('updateData', index)
    },
    removeData(index) {
      this.$emit('removeData', index)
    },
    expandCard() {
      this.$emit('expandCard')
    },
  },
}
</script>
