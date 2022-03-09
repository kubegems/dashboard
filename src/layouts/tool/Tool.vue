<template>
  <v-menu
    v-if="Admin"
    content-class="kubegems__tool-card-menu"
    top
    left
    offset-y
    origin="bottom right"
    transition="scale-transition"
    min-width="350px"
  >
    <template #activator="{ on, attrs }">
      <v-btn
        fixed
        dark
        fab
        bottom
        right
        small
        color="primary"
        v-bind="attrs"
        style="bottom: 15px;"
        v-on="on"
      >
        <v-icon small>fas fa-wrench</v-icon>
      </v-btn>
    </template>
    <v-card class="pa-0">
      <BaseSubTitle
        title="工具箱"
        :divider="false"
      />
      <v-card-text class="px-2 pt-0 pb-2">
        <v-card
          v-if="Admin"
          hover
          outlined
          class="my-2 pa-2"
          @click="toAdminViewport"
        >
          <v-card-text class="pa-1">
            <v-flex class="float-left">
              <v-icon
                left
                small
                color="primary"
              >
                fas fa-cog
              </v-icon>
            </v-flex>
            <v-flex class="text-subtitle-2 primary--text">平台管理</v-flex>
            <v-flex class="text-caption">
              以管理员身份查看操作所有资源。
            </v-flex>
            <div class="kubegems__clear-float" />
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>
  </v-menu>
</template>
<script>
import { mapGetters, mapState } from 'vuex'
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'

export default {
  name: 'Tool',
  mixins: [BaseSelect, BaseResource],
  inject: ['reload'],
  computed: {
    ...mapState(['Admin']),
    ...mapGetters(['Tenant', 'Cluster']),
  },
  methods: {
    async toAdminViewport() {
      this.$store.commit('CLEAR_VIRTUAL_SPACE')
      this.$store.commit('CLEAR_PLUGINS_INTERVAL')
      this.$store.commit('SET_ADMIN_VIEWPORT', true)
      if (this.Cluster().ID === 0) {
        await this.$store.dispatch('UPDATE_CLUSTER_DATA')
      }
      this.$router.push({ name: 'cluster-center', params: { cluster: this.Cluster().ClusterName } })
    },
  },
}
</script>

