<template>
  <v-flex>
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
      @submit.prevent
    >
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />
      <BaseSubTitle title="请求超时定义" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col cols="6">
            <v-switch
              v-model="timeout"
              hide-details
              class="mt-4"
              label="请求超时(Http Timeout)"
              @change="onTimeoutChange"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col
            v-if="timeout"
            cols="6"
          >
            <v-text-field
              v-model="obj.timeout"
              class="my-0"
              required
              label="超时时间(Timeout)"
              :rules="objRules.timeoutInputRule"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <v-switch
              v-model="retries"
              hide-details
              class="mt-4"
              label="请求重试(Http Retry)"
              @change="onRetriesChange"
            />
          </v-col>
        </v-row>
        <v-row v-if="retries">
          <v-col cols="6">
            <v-text-field
              v-model="obj.retries.attempts"
              class="my-0"
              required
              label="重试次数(Attempts)"
              type="number"
              :rules="objRules.attemptsRule"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.retries.perTryTimeout"
              class="my-0"
              required
              label="每次重试超时时间(Per Try Timeout)"
              :rules="objRules.perTryTimeoutRule"
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
  name: 'RequestTimeoutsBaseForm',
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
    retries: false,
    timeout: false,
    retriesDefault: {
      attempts: 3,
      perTryTimeout: '2s',
    },
    timeoutDefault: '2s',
    obj: {},
  }),
  computed: {
    ...mapState(['Admin', 'AdminViewport']),
    ...mapGetters(['Cluster']),
    objRules() {
      return {
        timeoutInputRule: [
          required,
          (v) =>
            !!new RegExp('^\\d+(s|h|m|ms)$').test(v) || '格式错误(示例:整数)',
        ],
        perTryTimeoutRule: [
          required,
          (v) =>
            !!new RegExp('^\\d+(s|h|m|ms)$').test(v) || '格式错误(示例:整数)',
        ],
        attemptsRule: [required],
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
          if (this.obj.timeout) this.timeout = true
          if (this.obj.retries) this.retries = true
        }
      })
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs.form.resetValidation()
      this.timeout = false
      this.retries = false
      this.obj = deepCopy(this.$options.data().obj)
    },
    onTimeoutChange() {
      if (this.timeout) {
        this.obj.timeout = this.timeoutDefault
      } else {
        this.$delete(this.obj, 'timeout')
      }
    },
    onRetriesChange() {
      if (this.retries) {
        this.obj.retries = this.retriesDefault
      } else {
        this.$delete(this.obj, 'retries')
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    getData() {
      return this.obj
    },
    // eslint-disable-next-line vue/no-unused-properties
    validate() {
      return this.$refs.form.validate(true)
    },
  },
}
</script>
