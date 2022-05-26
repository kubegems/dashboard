<template>
  <v-flex>
    <v-sheet
      v-for="(item, index) in servers"
      :key="index"
      class="grey lighten-4 rounded mb-2"
    >
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-subtitle-2 py-1 primary--text">
            {{ item.port.name }}
          </v-list-item-subtitle>
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item
              two-line
              class="float-left py-0 pl-0"
              style="width: 100px;"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ item.port.number }}&nbsp;
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  端口
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left py-0"
              style="width: 150px;"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ item.port.protocol }}&nbsp;
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  协议
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left py-0"
              style="width: 350px;"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ item.hosts }}&nbsp;
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  Host
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
                  {{ item.tls ? `${item.tls.credentialName}` : '无' }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  Tls
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
          @click="updateServer(index)"
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
          @click="removeServer(index)"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>
    <v-flex class="grey lighten-4 rounded">
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
              添加Server
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-flex>
</template>

<script>
export default {
  name: 'ServerItem',
  props: {
    servers: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    updateServer(index) {
      this.$emit('updateServer', index)
    },
    removeServer(index) {
      this.$emit('removeServer', index)
    },
    expandCard() {
      this.$emit('expandCard', 'serverForm')
    },
  },
}
</script>
