<template>
  <v-flex>
    <v-sheet v-if="trafficPolicy && JSON.stringify(trafficPolicy) !== '{}'" class="grey lighten-4 rounded mb-3">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item two-line class="float-left py-0 pl-0" style="width: 200px">
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ JSON.stringify(trafficPolicy.loadBalancer) !== '{}' ? '已设置' : '未设置' }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> loadBalancer </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line class="float-left py-0 pl-0" style="width: 200px">
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ JSON.stringify(trafficPolicy.connectionPool) !== '{}' ? '已设置' : '未设置' }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> connectionPool </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line class="float-left py-0 pl-0" style="width: 200px">
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ JSON.stringify(trafficPolicy.outlierDetection) !== '{}' ? '已设置' : '未设置' }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> outlierDetection </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line class="float-left py-0 pl-0" style="width: 200px">
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ JSON.stringify(trafficPolicy.tls) !== '{}' ? '已设置' : '未设置' }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> tls </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line class="float-left py-0 pl-0" style="width: 200px">
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{
                    trafficPolicy.portLevelSettings && trafficPolicy.portLevelSettings.length > 0 ? '已设置' : '未设置'
                  }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> portLevelSettings </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
        <v-btn dark text fab right x-small color="primary" @click="updateTrafficPolicy">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn dark text fab right x-small color="error" @click="removeTrafficPolicy">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>
    <v-flex v-else class="grey lighten-4 rounded">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0 text-center">
            <v-btn text color="primary" @click="expandCard">
              <v-icon left small> mdi-plus </v-icon>
              添加流量策略
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-flex>
</template>

<script>
  export default {
    name: 'TrafficPolicyItem',
    props: {
      trafficPolicy: {
        type: Object,
        default: () => {},
      },
    },
    methods: {
      updateTrafficPolicy() {
        this.$emit('updateTrafficPolicy');
      },
      removeTrafficPolicy() {
        this.$emit('removeTrafficPolicy');
      },
      expandCard() {
        this.$emit('expandCard', 'trafficPolicyForm');
      },
    },
  };
</script>
