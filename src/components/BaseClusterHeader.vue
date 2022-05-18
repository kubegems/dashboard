<template>
  <v-card class="rounded-tr-0 rounded-tl-0 mb-3" height="60">
    <v-card-title class="py-3 mt-n3" style="height: 60px;">
      <v-sheet v-if="selectable" class="text-subtitle-1">
        集群
        <v-menu
          v-model="clusterMenu"
          bottom
          left
          offset-y
          origin="top center"
          transition="scale-transition"
          nudge-bottom="5px"
          content-class="cluster-header__bg"
          max-height="300px"
        >
          <template #activator="{ on }">
            <v-btn
              depressed
              color="white"
              class="primary--text text-subtitle-1 font-weight-medium mt-n1"
              small
              dark
              v-on="on"
              @click="m_select_clusterSelectData(null)"
            >
              <v-icon left>fab fa-docker</v-icon>
              {{ Cluster().ClusterName }}
              <v-icon v-if="clusterMenu" right>fas fa-angle-up</v-icon>
              <v-icon v-else right>fas fa-angle-down</v-icon>
            </v-btn>
          </template>
          <v-data-iterator
            :items="[{ text: '集群', values: m_select_clusterItems }]"
            hide-default-footer
          >
            <template #no-data>
              <v-card>
                <v-card-text> 暂无集群 </v-card-text>
              </v-card>
            </template>
            <template #default="props">
              <v-card v-for="item in props.items" :key="item.text">
                <v-list dense>
                  <v-flex class="text-subtitle-2 text-center ma-2">
                    <span>集群</span>
                  </v-flex>
                  <v-divider class="mx-2"></v-divider>
                  <v-list-item
                    v-for="(cluster, index) in item.values"
                    :key="index"
                    class="text-body-2 text-center font-weight-medium px-2"
                    link
                    :style="
                      cluster.text === Cluster().ClusterName
                        ? `color: #1e88e5 !important;`
                        : ``
                    "
                    @click="setCluster(cluster)"
                  >
                    <v-list-item-content class="text-body-2 font-weight-medium text-start">
                      <div>
                        <v-icon left small color="primary">fab fa-docker</v-icon>
                        {{ cluster.text }}
                      </div>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>
            </template>
          </v-data-iterator>
        </v-menu>
      </v-sheet>
      <v-sheet v-else class="text-subtitle-1">
        集群
        <span class="text-subtitle-1 ml-2 primary--text font-weight-medium">
          {{ Cluster().ClusterName }}
        </span>
      </v-sheet>
    </v-card-title>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex'
import BaseResource from '@/mixins/resource'
import BaseSelect from '@/mixins/select'

export default {
  name: 'BaseClusterHeader',
  mixins: [BaseSelect, BaseResource],
  inject: ['reload'],
  props: {
    selectable: {
      type: Boolean,
      default: () => true,
    },
  },
  data: () => ({
    clusterMenu: false,
  }),
  computed: {
    ...mapGetters(['Cluster']),
  },
  methods: {
    async setCluster(item) {
      this.$store.commit('SET_NAMESPACE_FILTER', null)
      this.$router.replace({
        params: { cluster: item.text },
        query: {
          ...this.$route.query,
          ...{ namespace: null },
          ...{ page: 1 },
        },
      })
      await this.$store.dispatch('UPDATE_CLUSTER_DATA')
      window.setTimeout(() => {
        this.reload()
      }, 800)
    },
  },
}
</script>

<style lang="scss" scoped>
.cluster-header__bg {
  z-index: auto !important;
}
</style>
