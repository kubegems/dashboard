<template>
  <v-flex>
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
      @submit.prevent
    >
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />

      <BaseSubTitle title="匹配(headers)" />
      <StringMatchForm
        :data="obj.match[0].headers"
        @addData="addHeaderData"
      />

      <BaseSubTitle title="匹配(uri)" />
      <UriMatchForm
        :data="obj.match[0].uri"
        @addData="addUriData"
      />

      <BaseSubTitle title="Route定义" />
      <v-card-text class="pa-2">
        <v-row
          v-for="(workload, index) in serviceCopy ? serviceCopy.workloads : []"
          :key="index"
        >
          <v-col cols="6">
            <v-text-field
              class="my-0"
              required
              label="目标负载(Destination Workload)"
              :value="workload.name"
              readonly
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.route[index].weight"
              class="my-0"
              required
              label="流量权重(Traffic Weight)"
              suffix="%"
              type="number"
              :rules="objRules[index].weightRule"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-form>
  </v-flex>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import StringMatchForm from '@/views/resource/deploy/components/deploy_policy/traffic/HeaderTraffic/StringMatchForm'
import UriMatchForm from '@/views/resource/deploy/components/deploy_policy/traffic/UriTraffic/UriMatchForm'
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'
import { required } from '@/utils/rules'

export default {
  name: 'RequestRoutingBaseForm',
  components: {
    StringMatchForm,
    UriMatchForm,
  },
  mixins: [BaseSelect, BaseResource],
  props: {
    service: {
      type: Object,
      default: () => null,
    },
    vs: {
      type: Object,
      default: () => null,
    },
  },
  data: () => ({
    valid: false,
    expand: false,
    serviceCopy: null,
    routeDefault: {
      destination: {
        host: '',
        subset: '',
      },
      weight: 100,
    },
    obj: {
      match: [
        {
          headers: {},
          uri: {},
        },
      ],
      route: [],
    },
  }),
  computed: {
    ...mapState(['Admin', 'AdminViewport']),
    ...mapGetters(['Cluster']),
    objRules() {
      const rules = []
      if (this.serviceCopy) {
        this.serviceCopy.workloads.forEach(() => {
          rules.push({
            weightRule: [
              required,
              (v) =>
                !!(parseInt(v) <= 100 && parseInt(v) >= 0) ||
                '格式错误(示例:<=100整数)',
            ],
          })
        })
      }
      return rules
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
    service: {
      handler: function () {
        this.initObj()
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    initObj() {
      this.serviceCopy = deepCopy(this.service)
      this.obj.route = []
      if (this.serviceCopy) {
        const length = this.serviceCopy.workloads.length
        const weight = parseInt(100 / length)
        const remainder = 100 % length
        this.serviceCopy.workloads.forEach((w, index) => {
          const route = deepCopy(this.routeDefault)
          route.destination.host = `${this.serviceCopy.service.name}.${this.serviceCopy.service.namespace.name}.svc.cluster.local`
          route.destination.subset = `${
            w.labels.version ? w.labels.version : ''
          }`
          if (length === index + 1) {
            route.weight = weight + remainder
          } else {
            route.weight = weight
          }
          this.obj.route.push(route)
        })
      }
    },
    loadData(cover = false) {
      this.$nextTick(() => {
        if (cover) {
          this.obj = deepCopy(this.vs)
        }
      })
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.serviceCopy = null
      this.$refs.form.resetValidation()
      this.obj = deepCopy(this.$options.data().obj)
    },
    addHeaderData(data) {
      this.obj.match[0].headers = data
    },
    addUriData(data) {
      this.obj.match[0].uri = data
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
