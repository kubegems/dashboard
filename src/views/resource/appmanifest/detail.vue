<template>
  <v-container fluid>
    <BaseViewportHeader
      v-if="!AdminViewport"
      :environmented="Environment().ID > 0"
      :selectable="false"
    />
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <v-menu left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon
                  x-small
                  color="primary"
                  v-on="on"
                >
                  fas fa-ellipsis-v
                </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn
                    color="primary"
                    text
                    small
                    @click="updateApp"
                  >
                    编辑
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn
                    color="error"
                    text
                    small
                    @click="removeApp"
                  >
                    删除
                  </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-0">
      <v-col
        cols="2"
        class="pt-0"
      >
        <ResourceInfo :item="app" />
      </v-col>
      <v-col
        cols="10"
        class="pt-0"
      >
        <v-card>
          <v-card-text class="pa-0">
            <v-tabs
              v-model="tab"
              height="40"
              class="rounded-t pa-3"
            >
              <v-tab
                v-for="item in tabItems"
                :key="item.value"
              >
                {{ item.text }}
              </v-tab>
            </v-tabs>
          </v-card-text>
        </v-card>
        <component
          :is="tabItems[tab].value"
          :ref="tabItems[tab].value"
          class="mt-3"
          :app="app"
        />
      </v-col>
    </v-row>

    <UpdateApp
      ref="updateApp"
      @refresh="appDetail"
    />
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { deleteManifest, getManifestDetail } from '@/api'
import UpdateApp from './components/UpdateApp'
import ResourceInfo from './components/ResourceInfo'
import AppResourceFileList from './components/AppResourceFileList'
import AppDeployList from './components/AppDeployList'
import AppImageSecurityReportList from './components/AppImageSecurityReportList'
import BaseResource from '@/mixins/resource'

export default {
  name: 'AppManifestDetail',
  components: {
    UpdateApp,
    ResourceInfo,
    AppResourceFileList,
    AppDeployList,
    AppImageSecurityReportList,
  },
  mixins: [BaseResource],
  data: () => ({
    tab: 0,
    tabItems: [
      { text: '资源编排', value: 'AppResourceFileList' },
      { text: '部署状态', value: 'AppDeployList' },
      { text: '镜像安全', value: 'AppImageSecurityReportList' },
    ],
    app: null,
  }),
  computed: {
    ...mapState(['JWT', 'AdminViewport']),
    ...mapGetters(['Tenant', 'Project', 'Environment']),
  },
  mounted() {
    if (this.JWT) {
      this.$nextTick(() => {
        this.appDetail()
      })
    }
  },
  methods: {
    async appDetail() {
      const data = await getManifestDetail(
        this.$route.query.tenantid,
        this.$route.query.projectid,
        this.$route.params.name,
      )
      this.app = Object.assign(data, {
        TenantID: this.$route.query.tenantid,
        ProjectID: this.$route.query.projectid,
      })
    },
    updateApp() {
      this.$refs.updateApp.init(this.app)
      this.$refs.updateApp.open()
    },
    removeApp() {
      const item = this.app
      this.$store.commit('SET_CONFIRM', {
        title: `删除应用编排`,
        content: {
          text: `删除应用编排 ${item.name}`,
          type: 'delete',
          name: item.name,
        },
        param: { item },
        doFunc: async (param) => {
          await deleteManifest(
            param.item.TenantID,
            param.item.ProjectID,
            param.item.name,
          )
          this.$router.push({ name: 'app-list', params: this.$route.params })
        },
      })
    },
  },
}
</script>
