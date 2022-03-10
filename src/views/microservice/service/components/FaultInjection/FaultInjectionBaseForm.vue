<template>
  <v-flex>
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
      @submit.prevent
    >
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />
      <BaseSubTitle title="故障注入定义" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col cols="6">
            <v-switch
              v-model="delay"
              hide-details
              class="mt-4"
              label="请求延迟(Http Delay)"
              @change="onDelayChange"
            />
          </v-col>
        </v-row>
        <v-row v-if="delay">
          <v-col cols="6">
            <v-text-field
              v-model="obj.fault.delay.percentage.value"
              class="my-0"
              required
              label="延迟百分比(Delay Percentage)"
              type="number"
              :rules="objRules.delayPercentageRule"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.fault.delay.fixedDelay"
              class="my-0"
              required
              label="固定延迟(Fixed Delay)"
              :rules="objRules.fixedDelayRule"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <v-switch
              v-model="abort"
              hide-details
              class="mt-4"
              label="请求中止(Http Abort)"
              @change="onAbortChange"
            />
          </v-col>
        </v-row>
        <v-row v-if="abort">
          <v-col cols="6">
            <v-text-field
              v-model="obj.fault.abort.percentage.value"
              class="my-0"
              required
              label="中止百分比(Abort Percentage)"
              type="number"
              :rules="objRules.abortPercentageRule"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.fault.abort.httpStatus"
              class="my-0"
              required
              label="状态码(HTTP Status Code)"
              type="number"
              :rules="objRules.httpStatusRule"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-form>
  </v-flex>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'
import { required } from '@/utils/rules'

export default {
  name: 'FaultInjectionBaseForm',
  mixins: [BaseSelect, BaseResource],
  props: {
    vs: {
      type: Object,
      default: () => null,
    },
  },
  data: () => ({
    valid: false,
    expand: false,
    abort: false,
    delay: false,
    abortDefault: {
      httpStatus: 503,
      percentage: {
        value: 100,
      },
    },
    delayDefault: {
      fixedDelay: '5s',
      percentage: {
        value: 100,
      },
    },
    obj: {
      fault: {},
    },
  }),
  computed: {
    ...mapState(['Admin', 'AdminViewport']),
    ...mapGetters(['Cluster']),
    objRules() {
      return {
        delayPercentageRule: [
          required,
          (v) =>
            !!(parseInt(v) <= 100 && parseInt(v) >= 0) ||
            '格式错误(示例:<=100整数)',
        ],
        abortPercentageRule: [
          required,
          (v) =>
            !!(parseInt(v) <= 100 && parseInt(v) >= 0) ||
            '格式错误(示例:<=100整数)',
        ],
        fixedDelayRule: [
          required,
          (v) =>
            !!new RegExp('^\\d+(s|h|m|ms)$').test(v) || '格式错误(示例:整数)',
        ],
        httpStatusRule: [required],
      }
    },
  },
  watch: {
    vs: {
      handler: function () {
        if (this.vs) this.loadData(true)
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    loadData(cover = false) {
      this.$nextTick(() => {
        if (cover) {
          this.obj = deepCopy(this.vs)
          if (this.obj.fault.abort) this.abort = true
          if (this.obj.fault.delay) this.delay = true
        }
      })
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs.form.resetValidation()
      this.abort = false
      this.delay = false
      this.obj = deepCopy(this.$options.data().obj)
    },
    onDelayChange() {
      if (this.delay) {
        this.obj.fault.delay = this.delayDefault
      } else {
        this.$delete(this.obj.fault, 'delay')
      }
    },
    onAbortChange() {
      if (this.abort) {
        this.obj.fault.abort = this.abortDefault
      } else {
        this.$delete(this.obj.fault, 'abort')
      }
    },
  },
}
</script>
