<template>
  <v-row>
    <v-col
      cols="2"
      class="mb-2"
    >
      <v-card>
        <v-card-text class="pa-5">
          <div class="d-flex align-center">
            <Icon
              icon="mdi:server"
              class="mr-3 primary--text"
              width="35px"
              height="35px"
            />
            <div class="ml-2 mr-1">
              <h2 class="text-h5">
                {{ statistics ? statistics['count.clusters'] : 0 }}
              </h2>
              <div class="text-subtitle-2 font-weight-regular dashboard__resource__div">集群</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col
      cols="2"
      class="pb-0"
    >
      <v-card>
        <v-card-text class="pa-5">
          <div class="d-flex align-center">
            <Icon
              icon="mdi:cube-outline"
              class="mr-3 primary--text"
              width="35px"
              height="35px"
            />
            <div class="ml-2 mr-1">
              <h2 class="text-h5">
                {{ statistics ? statistics['count.projects'] : 0 }}
              </h2>
              <div class="text-subtitle-2 font-weight-regular dashboard__resource__div">项目</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col
      cols="2"
      class="pb-0"
    >
      <v-card>
        <v-card-text class="pa-5">
          <div class="d-flex align-center">
            <Icon
              icon="mdi:cloud"
              class="mr-3 primary--text"
              width="35px"
              height="35px"
            />
            <div class="ml-2 mr-1">
              <h2 class="text-h5">
                {{ statistics ? statistics['count.environments'] : 0 }}
              </h2>
              <div class="text-subtitle-2 font-weight-regular dashboard__resource__div">环境</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col
      cols="2"
      class="pb-0"
    >
      <v-card>
        <v-card-text class="pa-5">
          <div class="d-flex align-center">
            <Icon
              icon="mdi:vector-arrange-above"
              class="mr-3 primary--text"
              width="35px"
              height="35px"
            />
            <div class="ml-2 mr-1">
              <h2 class="text-h5">
                {{ statistics ? statistics['count.workloads'] : 0 }}
              </h2>
              <div class="text-subtitle-2 font-weight-regular dashboard__resource__div">工作负载</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col
      cols="2"
      class="pb-0"
    >
      <v-card>
        <v-card-text class="pa-5">
          <div class="d-flex align-center">
            <Icon
              icon="mdi:cube"
              class="mr-3 primary--text"
              width="35px"
              height="35px"
            />
            <div class="ml-2 mr-1">
              <h2 class="text-h5">
                {{ statistics ? statistics['count.pods'] : 0 }}
              </h2>
              <div class="text-subtitle-2 font-weight-regular dashboard__resource__div">容器组</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col
      cols="2"
      class="pb-0"
    >
      <v-card>
        <v-card-text class="pa-5">
          <div class="d-flex align-center">
            <Icon
              icon="mdi:account"
              class="mr-3 primary--text"
              width="35px"
              height="35px"
            />
            <div class="ml-2 mr-1">
              <h2 class="text-h5">
                {{ statistics ? statistics['count.users'] : 0 }}
              </h2>
              <div class="text-subtitle-2 font-weight-regular dashboard__resource__div">用户</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'DashboardCard',
  props: {
    statistics: {
      type: Object,
      default: () => null,
    },
  },
}
</script>

<style lang="scss" scoped>
.dashboard__resource__div {
  max-height: 44px;
  overflow: scroll;
}
</style>
