<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
    @submit.prevent
  >
    <v-flex :class="expand ? 'kubegems__overlay' : ''" />
    <v-expand-transition>
      <v-card
        v-show="expand"
        class="my-2 pa-0 kubegems__expand-transition"
        :elevation="4"
      >
        <v-card-text class="pa-2">
          <v-tabs
            v-model="tab"
            class="px-2"
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
        </v-card-text>
        <v-card-actions class="pa-2">
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
  </v-form>
</template>

<script>
import LoadBalancer from '@/views/microservice/service/components/destination_rule/policy/LoadBalancer'
import ConnectionPool from '@/views/microservice/service/components/destination_rule/policy/ConnectionPool'
import OutlierDetection from '@/views/microservice/service/components/destination_rule/policy/OutlierDetection'
import TLS from '@/views/microservice/service/components/destination_rule/policy/TLS'
import PortLevelSettings from '@/views/microservice/service/components/destination_rule/policy/PortLevelSettings'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'TrafficPolicyForm',
  components: {
    LoadBalancer,
    ConnectionPool,
    OutlierDetection,
    TLS,
    PortLevelSettings,
  },
  data() {
    return {
      valid: false,
      obj: {},
      expand: false,
      tab: 0,
      tabItems: [
        { text: '负载均衡', value: 'LoadBalancer' },
        { text: '连接池', value: 'ConnectionPool' },
        { text: '异常检测', value: 'OutlierDetection' },
        { text: 'TLS', value: 'TLS' },
        { text: '端口级别设置', value: 'PortLevelSettings' },
      ],
    }
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    init(data) {
      if (data) {
        this.obj = deepCopy(data)
      } else {
        this.obj = {}
      }
      this.expandCard()
    },
    reset() {
      this.$refs.form.reset()
    },
    expandCard() {
      const tabsSliderWrappers = document.querySelectorAll(
        '.v-tabs-slider-wrapper',
      )
      if (tabsSliderWrappers) {
        for (const index in tabsSliderWrappers) {
          if (tabsSliderWrappers[index].style) {
            tabsSliderWrappers[index].style.width = `189px`
          }
        }
      }
      this.expand = true
    },
    closeCard() {
      this.expand = false
      this.$emit('closeOverlay')
      this.reset()
    },
    addData() {
      this.$emit('addData', deepCopy(this.obj))
      this.closeCard()
    },
    updateComponentData(data) {
      this.obj = data
    },
  },
}
</script>
