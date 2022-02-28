<template>
  <BaseFullScreenDialog
    v-model="dialog"
    title="日志"
    icon="fas fa-list-ol"
    @dispose="dispose"
  >
    <template #header>
      <v-flex class="ml-2 text-h6 mt-n1">
        {{ item ? item.name : '' }}
      </v-flex>
    </template>
    <template #action>
      <v-sheet class="text-subtitle-1 primary white--text float-left mr-2">
        行数
        <v-menu
          v-model="countMenu"
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
              color="primary"
              class="white--text mt-n1"
              dark
              v-on="on"
            >
              {{ count }}
              <v-icon
                v-if="countMenu"
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
            :items="[{ text: '行数', values: counts }]"
            hide-default-footer
          >
            <template #default="props">
              <v-card
                v-for="item in props.items"
                :key="item.text"
              >
                <v-list dense>
                  <v-flex class="text-subtitle-2 text-center ma-2">
                    <span>行数</span>
                  </v-flex>
                  <v-divider class="mx-2" />
                  <v-list-item
                    v-for="(cou, index) in item.values"
                    :key="index"
                    class="text-body-2 text-center"
                    link
                    :style="
                      cou.text === count ? `color: #1e88e5 !important;` : ``
                    "
                    @click="updateCount(cou)"
                  >
                    <v-list-item-content>
                      <span class="font-weight-medium">
                        {{ cou.text }}
                      </span>
                    </v-list-item-content>
                  </v-list-item>
                  <v-text-field
                    id="logCount"
                    v-model="countText"
                    dense
                    class="ma-1"
                    style="width: 120px;"
                    solo
                    placeholder="手动输入行数"
                    flat
                    hide-details
                    @click.stop
                    @focus.stop
                    @keyup.enter="setCustomCount"
                  />
                </v-list>
              </v-card>
            </template>
          </v-data-iterator>
        </v-menu>
      </v-sheet>
      <v-flex class="text-subtitle-1 float-left primary white--text">
        实时
        <v-switch
          v-model="stream"
          class="pl-2 white--text float-right switch-mt"
          color="white"
          hide-details
          dense
          @change="onStreamSwitchChange"
        />
      </v-flex>
      <v-flex class="text-subtitle-1 float-left primary white--text">
        折行
        <v-switch
          v-model="linenotbreak"
          class="pl-2 white--text float-right switch-mt"
          color="white"
          hide-details
          dense
          @change="onLinebreakSwitchChange"
        />
      </v-flex>
      <v-sheet class="text-subtitle-1 primary white--text float-left">
        容器
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
              color="primary"
              class="white--text mt-n1"
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
                      <span class="font-weight-medium">
                        {{ con.text }}
                      </span>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>
            </template>
          </v-data-iterator>
        </v-menu>
      </v-sheet>
      <div class="kubegems__clear-float" />
    </template>
    <template #content>
      <ACEEditor
        ref="log"
        v-model="log"
        :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} rounded-0`"
        lang="yaml"
        :options="
          Object.assign($aceOptions, {
            readOnly: true,
            wrap: false,
          })
        "
        theme="chrome"
        :style="`height: ${height}px !important`"
        @init="$aceinit"
        @keydown.stop
      />
    </template>
  </BaseFullScreenDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'ContainerLog',
  mixins: [BaseResource],
  data: () => ({
    dialog: false,
    container: '',
    containers: [],
    count: 100,
    countText: '',
    counts: [
      { text: 100, value: 100 },
      { text: 500, value: 500 },
    ],
    log: '',
    logWebsocket: null,
    item: null,
    stream: false,
    linenotbreak: false,
    containerMenu: false,
    countMenu: false,
  }),
  computed: {
    ...mapState(['JWT', 'Scale']),
    height() {
      return window.innerHeight - 64 * this.Scale - 1
    },
  },
  mounted() {
    this.selectData()
  },
  destroyed() {
    this.dispose()
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    // eslint-disable-next-line vue/no-unused-properties
    init(container, item) {
      this.item = deepCopy(item)
      this.container = container
      this.selectData()
      this.initWebSocket()
    },
    selectData() {
      if (this.item) {
        this.containers = []
        this.item.containers.forEach((i) => {
          this.containers.push({
            text: i.name,
            value: i.name,
          })
        })
        if (this.container === '') this.container = this.containers[0].value
      }
    },
    onStreamSwitchChange() {
      if (this.logWebsocket) {
        this.logWebsocket.close()
        this.logWebsocket = null
      }
      this.initWebSocket()
    },
    onLinebreakSwitchChange() {
      if (this.$refs.log && this.$refs.log.editor) {
        this.$refs.log.editor.setOptions({ wrap: this.linenotbreak })
      }
    },
    setContainer(con) {
      if (this.container !== con.value) {
        this.container = con.value
        if (this.logWebsocket) {
          this.logWebsocket.close()
          this.logWebsocket = null
        }
        this.initWebSocket()
      }
    },
    setCustomCount() {
      if (this.countText) {
        if (!new RegExp('^\\d+$').test(this.countText)) {
          this.$store.commit('SET_SNACKBAR', {
            text: `请输入数字`,
            color: 'warning',
          })
          return
        }
        this.updateCount({ value: parseInt(this.countText) })
      }
      this.countMenu = false
    },
    updateCount(cou) {
      if (this.count !== cou.value) {
        this.count = cou.value
        if (this.logWebsocket) {
          this.logWebsocket.close()
          this.logWebsocket = null
        }
        this.initWebSocket()
      }
    },
    initWebSocket() {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const host = window.location.host
      const wsuri = `${protocol}://${host}/api/v1/proxy/cluster/${this.ThisCluster}/custom/core/v1/namespaces/${this.item.namespace}/pods/${this.item.name}/actions/logs?stream=true&container=${this.container}&token=${this.JWT}&tail=${this.count}&follow=${this.stream}`
      this.logWebsocket = new WebSocket(wsuri)
      this.logWebsocket.binaryType = 'arraybuffer'
      this.logWebsocket.onopen = () => {
        this.log = ''
      }
      this.logWebsocket.onmessage = this.onWebsocketMessage
      this.logWebsocket.onerror = this.onWebsocketError
      this.logWebsocket.onclose = (e) => {
        if (e.code === 1006 && this.stream) {
          this.logWebsocket = null
          this.initWebSocket()
        }
        // this.dispose()
        // this.dialog = false
      }
      if (this.$refs.log && this.$refs.log.editor) {
        this.$refs.log.editor.session.on('change', () => {
          this.$refs.log.editor.renderer.scrollToLine(Number.POSITIVE_INFINITY)
        })
      }
    },
    onWebsocketError(e) {
      this.$store.commit('SET_SNACKBAR', {
        text: `${JSON.stringify(e)}`,
        color: 'warning',
      })
    },
    onWebsocketMessage(e) {
      this.log += e.data
    },
    dispose() {
      if (this.logWebsocket) {
        this.logWebsocket.close()
        this.logWebsocket = null
      }
      this.log = ''
      this.stream = false
      this.linenotbreak = false
    },
  },
}
</script>

<style lang="scss" scoped>
.v-input--selection-controls {
  margin-top: 0 !important;
}

.switch-mt {
  margin-top: 2px !important;
}
</style>

<style lang="scss">
#logCount {
  text-align: center;
}
</style>
