<template>
  <v-form
    v-model="valid"
    lazy-validation
    class="my-2"
    @submit.prevent
  >
    <v-flex :class="expand ? 'kubegems__overlay' : ''" />
    <v-expand-transition>
      <v-card
        v-show="expand"
        class="my-2 pa-2 kubegems__expand-transition"
        :elevation="4"
      >
        <v-card-text class="pa-0">
          <v-form
            ref="form"
            v-model="valid"
            lazy-validation
            @submit.prevent
          >
            <v-sheet class="pt-2 px-2">
              <v-flex
                class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width"
              >
                <span>端口级别</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.port"
                  class="my-0"
                  required
                  label="port"
                  type="number"
                  :rules="objRules.portRule"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>

            <v-tabs
              v-model="tab"
              class="px-2 v-tabs--default"
              height="50"
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
              :traffic-policy="obj"
              @updateComponentData="updateComponentData"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn
            text
            small
            color="error"
            @click="closeCard"
          >
            取消
          </v-btn>
          <v-btn
            text
            small
            color="primary"
            @click="addData"
          >
            保存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>
    <v-sheet
      v-for="(portLevelSetting, index) in trafficPolicyCopy.portLevelSettings
        ? trafficPolicyCopy.portLevelSettings
        : []"
      :key="index"
      class="grey lighten-4 rounded ma-2"
    >
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__three-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ portLevelSetting.port }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  port
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__three-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{
                    JSON.stringify(portLevelSetting.loadBalancer) !== '{}'
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
              class="float-left pa-0 kubegems__three-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{
                    JSON.stringify(portLevelSetting.connectionPool) !== '{}'
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
              class="float-left pa-0 kubegems__three-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{
                    JSON.stringify(portLevelSetting.outlierDetection) !== '{}'
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
              class="float-left pa-0 kubegems__three-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{
                    JSON.stringify(portLevelSetting.tls) !== '{}'
                      ? '已设置'
                      : '未设置'
                  }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  tls
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
          @click="updateData(index)"
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
          @click="removeData(index)"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>
    <v-flex class="grey lighten-4 rounded ma-2">
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
              添加端口设置
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-form>
</template>

<script>
import LoadBalancer from './LoadBalancer'
import ConnectionPool from './ConnectionPool'
import OutlierDetection from './OutlierDetection'
import TLS from './TLS'
import { deepCopy } from '@/utils/helpers'
import { port } from '@/utils/rules'

export default {
  name: 'PortLevelSettings',
  components: {
    LoadBalancer,
    ConnectionPool,
    OutlierDetection,
    TLS,
  },
  props: {
    trafficPolicy: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      valid: false,
      expand: false,
      tab: 0,
      tabItems: [
        { text: '负载均衡', value: 'LoadBalancer' },
        { text: '连接池', value: 'ConnectionPool' },
        { text: '异常检测', value: 'OutlierDetection' },
        { text: 'TLS', value: 'TLS' },
      ],
      obj: {
        index: -1,
        port: null,
        loadBalancer: {},
        connectionPool: {},
        outlierDetection: {},
        tls: {},
      },
      objRules: {
        portRule: [port],
      },
      trafficPolicyCopy: {},
    }
  },
  watch: {
    trafficPolicy() {
      if (this.trafficPolicy) {
        this.trafficPolicyCopy = deepCopy(this.trafficPolicy)
      }
    },
  },
  mounted() {
    if (this.trafficPolicy) {
      this.trafficPolicyCopy = deepCopy(this.trafficPolicy)
    }
  },
  methods: {
    expandCard() {
      const tabsSliderWrappers = document.querySelectorAll(
        '.v-tabs-slider-wrapper',
      )
      if (tabsSliderWrappers.length > 0) {
        tabsSliderWrappers[tabsSliderWrappers.length - 1].style.width = `201px`
      }
      this.expand = true
    },
    closeCard() {
      this.expand = false
      this.obj = deepCopy(this.$options.data().obj)
      this.$refs.form.resetValidation()
    },
    updateComponentData(data) {
      this.obj = data
    },
    addData() {
      if (this.$refs.form.validate(true)) {
        if (!this.trafficPolicyCopy.portLevelSettings) {
          this.trafficPolicyCopy.portLevelSettings = []
        }
        const data = deepCopy(this.obj)
        delete data['index']
        if (this.obj.index === -1) {
          this.trafficPolicyCopy.portLevelSettings.push(data)
        } else {
          this.$set(
            this.trafficPolicyCopy.portLevelSettings,
            this.obj.index,
            data,
          )
        }
        this.$emit('updateComponentData', this.trafficPolicyCopy)
        this.closeCard()
      }
    },
    removeData(index) {
      this.$delete(this.trafficPolicyCopy.portLevelSettings, index)
      this.$emit('updateComponentData', this.trafficPolicyCopy)
    },
    updateData(index) {
      this.obj = deepCopy(this.trafficPolicyCopy.portLevelSettings[index])
      this.obj = { ...this.obj, index: index }
      this.expandCard()
    },
  },
}
</script>
