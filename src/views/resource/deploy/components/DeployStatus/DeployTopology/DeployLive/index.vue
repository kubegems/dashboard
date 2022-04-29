<template>
  <BasePanel
    v-model="panel"
    title="实时状态"
    :width="`50%`"
    icon="fas fa-spinner"
    @dispose="dispose"
  >
    <template #header>
      <span class="ml-2">
        {{ resource ? resource.kind : '' }}/{{ resource ? resource.name : '' }}
      </span>
    </template>
    <template #action>
      <v-sheet
        v-if="resource && resource.kind === 'Pod'"
        class="text-subtitle-1 mt-n1 white--text primary"
      >
        <v-menu
          v-model="containerMenu"
          bottom
          left
          offset-y
          origin="top center"
          transition="scale-transition"
          nudge-bottom="5px"
        >
          <template #activator="{ on }">
            <v-btn
              depressed
              color="white"
              class="white--text primary"
              dark
              v-on="on"
            >
              {{ container }}
              <v-icon
                v-if="containerMenu"
                right
              >
                fas fa-angle-up
              </v-icon>
              <v-icon
                v-else
                right
              >
                fas fa-angle-down
              </v-icon>
            </v-btn>
          </template>
          <v-data-iterator
            :items="[{ text: '容器', values: containers }]"
            hide-default-footer
          >
            <template #no-data>
              <v-card>
                <v-card-text> 暂无容器 </v-card-text>
              </v-card>
            </template>
            <template #default="props">
              <v-card
                v-for="item in props.items"
                :key="item.text"
              >
                <v-list dense>
                  <v-flex class="text-subtitle-2 text-center ma-2">
                    <span>容器</span>
                  </v-flex>
                  <v-divider class="mx-2" />
                  <v-list-item
                    v-for="(con, index) in item.values"
                    :key="index"
                    class="text-body-2 text-center"
                    link
                    :style="
                      con.text === container ? `color: #1e88e5 !important;` : ``
                    "
                    @click="setContainer(con)"
                  >
                    <v-list-item-content>
                      <span class="font-weight-medium">{{ con.text }}</span>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>
            </template>
          </v-data-iterator>
        </v-menu>
      </v-sheet>
    </template>
    <template #content>
      <v-card-text class="ma-0 pa-0">
        <v-tabs
          v-model="tab"
          height="45"
          class="rounded-t pa-0"
          fixed-tabs
        >
          <v-tab
            v-for="item in tabItems"
            :key="item.value"
          >
            {{ item.text }}
          </v-tab>
        </v-tabs>

        <component
          :is="tabItems[tab].value"
          :ref="tabItems[tab].value"
          :resource="resource"
          :container="container"
        />
      </v-card-text>
    </template>
  </BasePanel>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getPodDetail } from '@/api'
import DeployLiveYaml from './DeployLiveYaml'
import DeployDiffYaml from './DeployDiffYaml'
import DeployEvent from './DeployEvent'
import DeployLog from './DeployLog'
import DeployResult from './DeployResult'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'DeployLive',
  components: {
    DeployLiveYaml,
    DeployDiffYaml,
    DeployEvent,
    DeployLog,
    DeployResult,
  },
  mixins: [BaseResource],
  data: () => ({
    panel: false,
    containerMenu: false,
    resource: null,
    items: [],
    tab: 0,
    container: '',
    containers: [],
  }),
  computed: {
    ...mapState(['Scale']),
    ...mapGetters(['Tenant', 'Project']),
    tabItems() {
      if (this.resource && this.resource.kind === 'Pod') {
        return [
          { text: '资源Live', value: 'DeployLiveYaml' },
          { text: '资源Diff', value: 'DeployDiffYaml' },
          { text: '事件', value: 'DeployEvent' },
          { text: '日志', value: 'DeployLog' },
        ]
      } else if (this.resource && this.resource.kind === 'Application') {
        return [
          { text: '资源Live', value: 'DeployLiveYaml' },
          { text: '应用状态', value: 'DeployResult' },
        ]
      } else {
        return [
          { text: '资源Live', value: 'DeployLiveYaml' },
          { text: '资源Diff', value: 'DeployDiffYaml' },
          { text: '事件', value: 'DeployEvent' },
        ]
      }
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.panel = true
    },
    // eslint-disable-next-line vue/no-unused-properties
    init(resource) {
      this.resource = deepCopy(resource)
      if (this.resource && this.resource.kind === 'Pod') {
        this.podDetail()
      }
    },
    async podDetail() {
      const data = await getPodDetail(
        this.ThisCluster,
        this.resource.namespace,
        this.resource.name,
      )
      this.containers = []
      data.spec.containers.forEach((container) => {
        this.containers.push({ text: container.name, value: container.name })
      })
      if (data.spec.containers && data.spec.containers.length > 0) {
        this.container = data.spec.containers[0].name
      }
    },
    setContainer(con) {
      if (this.container !== con.value) {
        this.container = con.value
        this.$nextTick(() => {
          this.$refs[this.tabItems[this.tab].value].refresh()
        })
      }
    },
    dispose() {
      this.items = []
      this.tab = 0
    },
  },
}
</script>
