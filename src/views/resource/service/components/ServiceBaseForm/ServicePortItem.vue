<template>
  <v-flex>
    <v-sheet
      v-for="(item, index) in ports"
      :key="index"
      class="grey lighten-4 rounded mb-2"
    >
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-subtitle-2 py-1 primary--text">
            {{ item.name }}
          </v-list-item-subtitle>
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item
              two-line
              class="float-left py-0 pl-0"
              style="width: 250px;"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ item.targetPort }}&nbsp;
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  容器端口
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left py-0"
              style="width: 250px;"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{
                    item.name && item.name.indexOf('-') > -1
                      ? item.name.substr(0, item.name.indexOf('-'))
                      : appProtocol.indexOf(item.name) > -1
                        ? item.name
                        : '未知'
                  }}&nbsp;
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  应用协议
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left py-0"
              style="width: 250px;"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ item.port }}&nbsp;
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  服务端口
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
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
          @click="updatePort(index)"
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
          @click="removePort(index)"
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
              添加端口
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-flex>
</template>

<script>
export default {
  name: 'ServicePortItem',
  props: {
    ports: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      appProtocol: [
        'http',
        'https',
        'tcp',
        'mongo',
        'grpc',
        'tls',
        'http2',
        'mysql',
        'redis',
      ],
    }
  },
  methods: {
    updatePort(index) {
      this.$emit('updatePort', index)
    },
    removePort(index) {
      this.$emit('removePort', index)
    },
    expandCard() {
      this.$emit('expandCard', 'servicePortForm')
    },
  },
}
</script>
