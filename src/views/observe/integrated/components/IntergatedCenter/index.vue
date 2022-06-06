<template>
  <BasePanel
    v-model="panel"
    :title="`接入配置`"
    :width="`50%`"
    icon="fas fa-link"
    @dispose="dispose"
  >
    <template #action>
      <v-btn
        color="white"
        text
        class="mt-n1 ml-2"
        @click="addData"
      >
        保存
      </v-btn>
    </template>
    <template #content>
      <v-card-text class="ma-0 pa-0">
        <v-list-item>
          <v-list-item-avatar
            tile
            size="80"
            class="mb-0"
          >
            <BaseLogo
              :icon-name="item.name"
              :width="72"
            />
          </v-list-item-avatar>
          <span class="text-subtitle-1 kubegems__text">
            {{
              type === 'app' ?
                `配置 ${item.name} 应用的Trace, Metrics, Logging` :
                `配置 ${item.name} 中间件的Metrics, Logging`
            }}
          </span>
        </v-list-item>
        <v-divider />
        <template v-if="type">
          <v-tabs
            v-model="tab"
            height="45"
            class="rounded-t pa-0 v-tabs--default"
            fixed-tabs
          >
            <v-tab
              v-for="t in tabItems"
              :key="t.value"
            >
              {{ t.text }}
            </v-tab>
          </v-tabs>

          <component
            :is="tabItems[tab].value"
            :ref="tabItems[tab].value"
            :v="item.value || item.name"
          />
        </template>
      </v-card-text>
    </template>
  </BasePanel>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import Trace from './Trace'
import Metrics from './Metrics'
import Logging from './Logging'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'DeployLive',
  components: {
    Trace,
    Metrics,
    Logging,
  },
  mixins: [],
  data: () => ({
    panel: false,
    tab: 0,
    item: {},
    type: undefined,
  }),
  computed: {
    ...mapState(['Scale']),
    ...mapGetters(['Tenant']),
    tabItems() {
      const items = [
        { text: 'Metrics', value: 'Metrics' },
        { text: 'Logging', value: 'Logging' },
      ]
      if (this.type === 'app') {
        items.splice(0, 0, { text: 'Trace', value: 'Trace' })
      }
      return items
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.panel = true
    },
    // eslint-disable-next-line vue/no-unused-properties
    init(item, type) {
      this.item = deepCopy(item)
      this.type = type
    },
    dispose() {
      this.tab = 0
      this.type = undefined
    },
    addData() {
      this.$refs[this.tabItems[this.tab].value].addData()
      this.panel = false
    },
  },
}
</script>
