<template>
  <v-flex>
    <v-flex
      v-for="(item, index) in items"
      :key="index"
      class="grey lighten-4 rounded-0 ma-2"
    >
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item
              two-line
              class="float-left py-0 pl-0"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 primary--text">
                  授信域名 {{ index + 1 }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  {{ item }}
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
          @click="updateConfig(index)"
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
          @click="removeConfig(index)"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-flex>
    <v-flex class="grey lighten-4 rounded-0 ma-2">
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
              添加域名
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-flex>
</template>

<script>
export default {
  name: 'DnsNameItem',
  props: {
    items: {
      type: Array,
      default: () => null,
    },
  },
  methods: {
    expandCard() {
      this.$emit('expandCard', 'dnsNameForm')
    },
    removeConfig(index) {
      this.$emit('removeConfig', 'DnsName', index)
    },
    updateConfig(index) {
      this.$emit('updateConfig', 'DnsName', index)
    },
  },
}
</script>
