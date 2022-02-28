<template>
  <v-flex>
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
    >
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />
      <BaseSubTitle title="网关定义" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col
            v-if="AdminViewport"
            cols="6"
          >
            <v-autocomplete
              v-model="obj.spec.tenant"
              :items="tenantSelect"
              :rules="objRules.tenantRule"
              color="primary"
              label="租户"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
              item-value="text"
              :readonly="edit"
              @focus="onTenantSelectFocus"
            >
              <template #selection="{ item }">
                <v-chip
                  color="primary"
                  small
                  class="ma-1"
                  :disabled="item.disabled"
                >
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.metadata.name"
              class="my-0"
              required
              label="网关名称"
              :rules="objRules.nameRule"
              :readonly="edit"
            />
          </v-col>
          <v-col cols="6">
            <v-autocomplete
              v-model="obj.spec.type"
              :items="gatewayTypes"
              :rules="objRules.gatewayTypeRule"
              color="primary"
              label="网关类型"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
            >
              <template #selection="{ item }">
                <v-chip
                  color="primary"
                  small
                  class="ma-1"
                >
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="6">
            <v-autocomplete
              v-model="protocol"
              :items="protocolTypes"
              :rules="objRules.protocolTypeRule"
              color="primary"
              label="协议"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
              @change="onProtocolChange"
            >
              <template #selection="{ item }">
                <v-chip
                  color="primary"
                  small
                  class="ma-1"
                >
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="obj.spec.replicas"
              class="my-0"
              required
              label="副本数"
              type="number"
              :rules="objRules.replicasRule"
            />
          </v-col>

          <v-col cols="6">
            <v-text-field
              v-model="obj.spec.baseDomain"
              class="my-0"
              required
              label="默认域名"
              :rules="objRules.baseDomainRule"
            >
              <template #append>
                <v-btn
                  small
                  text
                  color="primary"
                  class="my-0"
                  @click="setDomain(obj)"
                >
                  使用默认域名
                </v-btn>
              </template>
            </v-text-field>
          </v-col>
        </v-row>
      </v-card-text>

      <DataForm
        ref="dataForm"
        :data="obj.spec.configMapData"
        @addData="addData"
        @closeOverlay="closeExpand"
      />
      <BaseSubTitle title="配置项">
        <template #tips>
          <v-icon
            small
            right
            color="warning"
            class="mt-n1 kubegems__pointer"
            @click="help"
          >
            mdi-information-variant
          </v-icon>
        </template>
      </BaseSubTitle>
      <v-card-text class="pa-2">
        <GatewayDataItem
          :data="obj.spec.configMapData"
          @updateData="updateData"
          @removeData="removeData"
          @expandCard="expandCard"
        />
      </v-card-text>
    </v-form>
  </v-flex>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'
import GatewayDataItem from './GatewayDataItem'
import DataForm from '@/views/resource/components/common/DataForm'
import { deepCopy } from '@/utils/helpers'
import { k8sName, required, positiveInteger } from '@/utils/rules'

export default {
  name: 'GatewayBaseForm',
  components: { GatewayDataItem, DataForm },
  mixins: [BaseSelect, BaseResource],
  props: {
    item: {
      type: Object,
      default: () => null,
    },
    edit: {
      type: Boolean,
      default: () => false,
    },
  },
  data: () => ({
    valid: false,
    expand: false,
    gatewayTypes: [
      { text: '常规集群网关(NodePort)', value: 'NodePort' },
      { text: '外部负载均衡网关(LoadBalancer)', value: 'LoadBalancer' },
    ],
    protocolTypes: [
      { text: 'http/1.1', value: 'http/1.1' },
      { text: 'http/2(仅对启用ssl的服务生效)', value: 'http/2' },
    ],
    protocol: 'http/1.1',
    obj: {
      apiVersion: 'gems.kubegems.io/v1beta1',
      kind: 'TenantGateway',
      metadata: {
        name: '',
      },
      spec: {
        tenant: '',
        type: 'NodePort',
        replicas: 1,
        baseDomain: '',
        configMapData: {},
      },
    },
  }),
  computed: {
    ...mapState(['AdminViewport']),
    ...mapGetters(['Tenant']),
    objRules() {
      return {
        nameRule: [
          required,
          k8sName,
        ],
        tenantRule: [required],
        gatewayTypeRule: [required],
        protocolTypeRule: [required],
        replicasRule: [positiveInteger],
        baseDomainRule: [(v) => !!v || "域名格式错误（支持通配符'*'）"],
      }
    },
  },
  watch: {
    item() {
      this.loadData(true)
    },
  },
  mounted() {
    this.loadData(false)
  },
  methods: {
    async loadData(cover = false) {
      this.$nextTick(() => {
        if (cover) {
          if (!this.item) {
            this.obj = this.$options.data().obj
            this.$refs.form.resetValidation()
          } else {
            this.obj = deepCopy(this.item)
          }
        }
        if (!this.AdminViewport) {
          this.obj.spec.tenant = this.Tenant().TenantName
        }
        if (!this.obj.spec.configMapData) {
          this.$set(this.obj.spec, 'configMapData', {})
        }
        this.tenantSelectData()
      })
    },
    addData(data) {
      this.obj.spec.configMapData = data
      this.$refs.dataForm.closeCard()
      if (data['http2']) {
        if (data['http2'] === 'False') {
          this.protocol = 'http/1.1'
        } else if (data['http2'] === 'True') {
          this.protocol = 'http/2'
        }
      }
    },
    updateData(key) {
      const data = { key: key, value: this.obj.spec.configMapData[key] }
      this.$refs.dataForm.init(data)
      this.expand = true
      if (key === 'http2') {
        if (this.obj.spec.configMapData[key] === 'False') {
          this.protocol = 'http/1.1'
        } else if (this.obj.spec.configMapData[key] === 'True') {
          this.protocol = 'http/2'
        }
      }
    },
    removeData(key) {
      if (key === 'http2') {
        this.protocol = 'http/1.1'
      }
      this.$delete(this.obj.spec.configMapData, key)
    },
    expandCard() {
      this.$nextTick(() => {
        this.$refs.dataForm.expandCard()
        this.expand = true
      })
    },
    closeExpand() {
      this.expand = false
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs.dataForm.closeCard()
      this.$refs.form.reset()
    },
    setDomain(obj) {
      obj.spec.baseDomain = '*.gemscloud.com'
    },
    help() {
      window.open(
        'https://docs.nginx.com/nginx-ingress-controller/configuration/global-configuration/configmap-resource/',
      )
    },
    onProtocolChange() {
      if (this.protocol === 'http/2') {
        this.$set(this.obj.spec.configMapData, 'http2', 'True')
      } else {
        this.$set(this.obj.spec.configMapData, 'http2', 'False')
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    setData(data) {
      this.obj = data
    },
    onTenantSelectFocus() {
      this.tenantSelectData()
    },
  },
}
</script>
