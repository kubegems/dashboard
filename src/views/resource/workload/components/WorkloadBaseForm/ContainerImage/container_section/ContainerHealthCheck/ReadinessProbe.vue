<template>
  <v-sheet
    class="grey lighten-4 rounded ma-2"
  >
    <v-list-item two-line>
      <v-list-item-content class="py-2">
        <v-list-item-subtitle class="text-body-2 py-0">
          <v-list-item
            two-line
            class="float-left pa-0"
          >
            <v-list-item-content class="py-0">
              <v-list-item-title class="text-subtitle-2 py-1">
                就绪检查
              </v-list-item-title>
              <v-list-item-subtitle class="text-body-2 py-1">
                类型
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <template v-if="containerCopy.readinessProbe.httpGet">
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__three-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  初始延迟{{
                    containerCopy.readinessProbe.initialDelaySeconds
                  }}s&nbsp;超时{{
                    containerCopy.readinessProbe.timeoutSeconds
                  }}s
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  HTTP请求检查
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ containerCopy.readinessProbe.httpGet.scheme }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  类型
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__three-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ containerCopy.readinessProbe.httpGet.path }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  路径
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ containerCopy.readinessProbe.httpGet.port }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  端口
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </template>
          <template v-else-if="containerCopy.readinessProbe.exec">
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__three-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  初始延迟{{
                    containerCopy.readinessProbe.initialDelaySeconds
                  }}s&nbsp;超时{{
                    containerCopy.readinessProbe.timeoutSeconds
                  }}s
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  执行命令检查
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 kubegems__break-all">
                  <template
                    v-for="command in containerCopy.readinessProbe.exec
                      .command"
                  >
                    {{ command }}
                  </template>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  命令
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </template>
          <template v-else-if="containerCopy.readinessProbe.tcpSocket">
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__three-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  初始延迟{{
                    containerCopy.readinessProbe.initialDelaySeconds
                  }}s&nbsp;超时{{
                    containerCopy.readinessProbe.timeoutSeconds
                  }}s
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  TCP端口检查
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ containerCopy.readinessProbe.tcpSocket.port }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  端口
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </template>
        </v-list-item-subtitle>
        <div class="kubegems__clear-float" />
      </v-list-item-content>
      <v-btn
        dark
        text
        fab
        right
        x-small
        color="primary"
        @click="updateData('readinessProbe')"
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
        @click="removeData('readinessProbe')"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-list-item>
  </v-sheet>
</template>

<script>
export default {
  name: 'ReadinessProbe',
  props: {
    containerCopy: {
      type: Object,
      default: () => {},
    },
  },
  methods: {
    updateData(type) {
      this.$emit('updateData', type)
    },
    removeData(type) {
      this.$emit('removeData', type)
    },
  },
}
</script>
