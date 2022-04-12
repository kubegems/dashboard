<template>
  <v-flex>
    <v-sheet
      v-for="(item, index) in alertlevels"
      :key="index"
      class="grey lighten-4 rounded mb-2"
    >
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item
              two-line
              class="float-left py-0 pl-0"
              style="width: 150px;"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 primary--text">
                  级别
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  {{ severityMap(item.severity) }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left py-0 pl-0"
              style="width: 150px;"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 primary--text">
                  触发条件
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  {{ compareMap(item.compareOp) }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left py-0 pl-0"
              style="width: 150px;"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 primary--text">
                  阈值
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  {{ item.compareValue }}
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
          @click="updateAlertLevel(index)"
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
          @click="removeAlertLevel(index)"
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
              添加级别
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-flex>
</template>

<script>
import BaseAlert from '../../../mixins/alert'

export default {
  name: 'AlertLevelItem',
  mixins: [BaseAlert],
  props: {
    alertlevels: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    updateAlertLevel(index) {
      this.$emit('updateAlertLevel', index)
    },
    removeAlertLevel(index) {
      this.$emit('removeAlertLevel', index)
    },
    expandCard() {
      this.$emit('expandCard', 'alertLevelForm')
    },
  },
}
</script>
