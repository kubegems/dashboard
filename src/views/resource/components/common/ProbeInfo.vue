<template>
  <v-flex class="my-1">
    <v-menu
      open-on-hover
      bottom
      max-width="200px"
      offset-y
      origin="top center"
      transition="scale-transition"
      :close-on-content-click="false"
      :close-delay="200"
    >
      <template #activator="{ on }">
        <span
          class="kubegems__pointer"
          v-on="on"
        >
          <v-icon
            small
            color="primary"
          >mdi-medical-bag</v-icon>
          {{ title }}
        </span>
      </template>
      <v-card flat>
        <v-flex class="text-body-2 text-center primary white--text py-2">
          <v-icon
            color="white"
            left
            small
          >
            mdi-eyedropper
          </v-icon>
          <span>{{ title }}</span>
        </v-flex>
        <v-list
          dense
          class="pa-0 kubegems__tip"
        >
          <v-list-item>
            <v-list-item-content>
              <template v-if="item.httpGet">
                <v-list-item
                  two-line
                  class="float-left pa-0"
                >
                  <v-list-item-content class="py-0">
                    <v-list-item-title> HTTP请求检查 </v-list-item-title>
                    <v-list-item-content class="text-caption kubegems__text">
                      初始延迟{{ item.initialDelaySeconds }}s&nbsp;超时{{
                        item.timeoutSeconds
                      }}s&nbsp;频率{{ item.periodSeconds }}s
                    </v-list-item-content>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item
                  two-line
                  class="float-left pa-0"
                >
                  <v-list-item-content class="py-0">
                    <v-list-item-title> 类型 </v-list-item-title>
                    <v-list-item-content class="text-caption kubegems__text">
                      {{ item.httpGet.scheme }}
                    </v-list-item-content>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item
                  two-line
                  class="float-left pa-0"
                >
                  <v-list-item-content class="py-0">
                    <v-list-item-title> 路径 </v-list-item-title>
                    <v-list-item-content class="text-caption kubegems__text">
                      {{ item.httpGet.path }}
                    </v-list-item-content>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item
                  two-line
                  class="float-left pa-0"
                >
                  <v-list-item-content class="py-0">
                    <v-list-item-title> 端口 </v-list-item-title>
                    <v-list-item-content class="text-caption kubegems__text">
                      {{ item.httpGet.port }}
                    </v-list-item-content>
                  </v-list-item-content>
                </v-list-item>
              </template>
              <template v-else-if="item.exec">
                <v-list-item
                  two-line
                  class="float-left pa-0"
                >
                  <v-list-item-content class="py-0">
                    <v-list-item-title> 执行命令检查 </v-list-item-title>
                    <v-list-item-content class="text-caption kubegems__text">
                      初始延迟{{ item.initialDelaySeconds }}s&nbsp;超时{{
                        item.timeoutSeconds
                      }}s&nbsp;频率{{ item.periodSeconds }}s
                    </v-list-item-content>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item
                  two-line
                  class="float-left pa-0"
                >
                  <v-list-item-content class="py-0">
                    <v-list-item-title> 命令 </v-list-item-title>
                    <v-list-item-content
                      class="text-caption kubegems__text kubegems__break-all"
                    >
                      <template v-for="command in item.exec.command">
                        {{ command }}
                      </template>
                    </v-list-item-content>
                  </v-list-item-content>
                </v-list-item>
              </template>
              <template v-else-if="item.tcpSocket">
                <v-list-item
                  two-line
                  class="float-left pa-0"
                >
                  <v-list-item-content class="py-0">
                    <v-list-item-title> TCP端口检查 </v-list-item-title>
                    <v-list-item-content class="text-caption kubegems__text">
                      初始延迟{{ item.initialDelaySeconds }}s&nbsp;超时{{
                        item.timeoutSeconds
                      }}s&nbsp;频率{{ item.periodSeconds }}s
                    </v-list-item-content>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item
                  two-line
                  class="float-left pa-0"
                >
                  <v-list-item-content class="py-0">
                    <v-list-item-title> 端口 </v-list-item-title>
                    <v-list-item-content class="text-caption kubegems__text">
                      {{ item.tcpSocket.port }}
                    </v-list-item-content>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </v-flex>
</template>

<script>
export default {
  name: 'ProbInfo',
  props: {
    item: {
      type: Object,
      default: () => {},
    },
    title: {
      type: String,
      default: () => '',
    },
  },
}
</script>
