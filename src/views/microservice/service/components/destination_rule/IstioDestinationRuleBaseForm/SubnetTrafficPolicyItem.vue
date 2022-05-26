<template>
  <v-flex>
    <v-sheet
      v-for="(subset, index) in subsets"
      :key="index"
      class="grey lighten-4 rounded mb-2"
    >
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-subtitle-2 py-1 primary--text">
            {{ subset.name }}
          </v-list-item-subtitle>
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item
              two-line
              class="float-left py-0 pl-0"
              style="width: 200px;"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{
                    subset.trafficPolicy &&
                      JSON.stringify(subset.trafficPolicy.loadBalancer) !== '{}'
                      ? '已设置'
                      : '未设置'
                  }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  loadBalancer
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left py-0 pl-0"
              style="width: 200px;"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{
                    subset.trafficPolicy &&
                      JSON.stringify(subset.trafficPolicy.connectionPool) !== '{}'
                      ? '已设置'
                      : '未设置'
                  }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  connectionPool
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left py-0 pl-0"
              style="width: 200px;"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{
                    subset.trafficPolicy &&
                      JSON.stringify(subset.trafficPolicy.outlierDetection) !==
                      '{}'
                      ? '已设置'
                      : '未设置'
                  }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  outlierDetection
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left py-0 pl-0"
              style="width: 200px;"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{
                    subset.trafficPolicy &&
                      JSON.stringify(subset.trafficPolicy.tls) !== '{}'
                      ? '已设置'
                      : '未设置'
                  }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  tls
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left py-0 pl-0"
              style="width: 200px;"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{
                    subset.trafficPolicy &&
                      subset.trafficPolicy.portLevelSettings &&
                      subset.trafficPolicy.portLevelSettings.length > 0
                      ? '已设置'
                      : '未设置'
                  }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  portLevelSettings
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
          @click="updateTrafficPolicy(index)"
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
          @click="removeTrafficPolicy(index)"
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
              添加流量策略子集
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-flex>
</template>

<script>
export default {
  name: 'SubnetTrafficPolicyItem',
  props: {
    subsets: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    updateTrafficPolicy(index) {
      this.$emit('updateSubnetTrafficPolicy', index)
    },
    removeTrafficPolicy(index) {
      this.$emit('removeSubnetTrafficPolicy', index)
    },
    expandCard() {
      this.$emit('expandCard', 'subnetTrafficPolicyForm')
    },
  },
}
</script>
