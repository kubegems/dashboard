<template>
  <v-flex>
    <v-sheet
      v-for="(item, index) in receivers"
      :key="index"
      class="grey lighten-4 rounded mb-2"
    >
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item
              two-line
              class="float-left py-0 pl-0"
              style="width: 400px;"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 primary--text">
                  接收器
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  {{ item.name }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left py-0 pl-0"
              style="width: 400px;"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 primary--text">
                  发送间隔
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  {{ item.interval }}
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
          @click="updateReceiver(index)"
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
          @click="removeReceiver(index)"
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
              添加接收器
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-flex>
</template>

<script>
export default {
  name: 'ReceiverItem',
  props: {
    receivers: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    updateReceiver(index) {
      this.$emit('updateReceiver', index)
    },
    removeReceiver(index) {
      this.$emit('removeReceiver', index)
    },
    expandCard() {
      this.$emit('expandCard', 'receiverForm')
    },
  },
}
</script>
