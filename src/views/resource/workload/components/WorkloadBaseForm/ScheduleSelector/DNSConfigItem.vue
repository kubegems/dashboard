<template>
  <v-flex>
    <v-sheet
      v-if="dnsConfig"
      class="grey lighten-4 rounded mb-2"
    >
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-subtitle-2 py-1 primary--text" />
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item
              two-line
              class="pa-0"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  <span
                    v-for="(nameserver, index) in dnsConfig &&
                      dnsConfig.nameservers
                      ? dnsConfig.nameservers
                      : []"
                    :key="index"
                    class="mr-2"
                  >
                    {{ nameserver }}
                  </span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  nameservers
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="pa-0"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  <span
                    v-for="(search, index) in dnsConfig && dnsConfig.searches
                      ? dnsConfig.searches
                      : []"
                    :key="index"
                    class="mr-2"
                  >
                    {{ search }}
                  </span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  searches
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="pa-0"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  <span
                    v-for="(option, index) in dnsConfig && dnsConfig.options
                      ? dnsConfig.options
                      : []"
                    :key="index"
                    class="mr-2"
                  >
                    {{ option.name }}
                    <span v-if="option.value">: {{ option.value }}</span>
                  </span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  options
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
          @click="updateDNSConfig"
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
          @click="removeDNSConfig"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>
    <v-flex
      v-else
      class="grey lighten-4 rounded-0 mt-0"
    >
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
              添加DNS配置
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
  name: 'DNSConfigItem',
  mixins: [BaseResource],
  props: {
    dnsConfig: {
      type: Object,
      default: () => null,
    },
  },
  methods: {
    updateDNSConfig() {
      this.$emit('updateDNSConfig')
    },
    removeDNSConfig() {
      this.$emit('removeDNSConfig')
    },
    expandCard() {
      this.$emit('expandCard', 'dnsConfigForm')
    },
  },
}
</script>
