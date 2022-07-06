<template>
  <v-row>
    <v-col class="mb-2" cols="3">
      <v-card>
        <v-card-text class="pa-5">
          <div class="d-flex align-center">
            <Icon class="mr-3 primary--text" height="35px" icon="mdi:server" width="35px" />
            <div class="ml-2 mr-1">
              <h2 class="text-h5">
                {{ statistics ? statistics['count.clusters'] : 0 }}
              </h2>
              <div class="text-subtitle-2 font-weight-regular dashboard__resource__div">已分配CPU</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col class="pb-0" cols="3">
      <v-card>
        <v-card-text class="pa-5">
          <div class="d-flex align-center">
            <Icon class="mr-3 primary--text" height="35px" icon="mdi:cube-outline" width="35px" />
            <div class="ml-2 mr-1">
              <h2 class="text-h5">
                {{ statistics ? statistics['count.projects'] : 0 }}
              </h2>
              <div class="text-subtitle-2 font-weight-regular dashboard__resource__div">已分配内存</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col class="pb-0" cols="3">
      <v-card>
        <v-card-text class="pa-5">
          <div class="d-flex align-center">
            <Icon class="mr-3 primary--text" height="35px" icon="mdi:cloud" width="35px" />
            <div class="ml-2 mr-1">
              <h2 class="text-h5">
                {{ statistics ? statistics['count.environments'] : 0 }}
              </h2>
              <div class="text-subtitle-2 font-weight-regular dashboard__resource__div">已分配GPU</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col class="pb-0" cols="3">
      <v-card>
        <v-card-text class="pa-5">
          <div class="d-flex align-center">
            <Icon class="mr-3 primary--text" height="35px" icon="mdi:vector-arrange-above" width="35px" />
            <div class="ml-2 mr-1">
              <h2 class="text-h5">
                {{ statistics ? statistics['count.workloads'] : 0 }}
              </h2>
              <div class="text-subtitle-2 font-weight-regular dashboard__resource__div">已分配显存</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
  export default {
    name: 'Card',
    props: {
      statistics: {
        type: Object,
        default: () => null,
      },
    },
  };
</script>

<style lang="scss" scoped>
  .dashboard__resource__div {
    max-height: 44px;
    overflow: hidden;
    background: none;
    border: none;
  }
</style>
