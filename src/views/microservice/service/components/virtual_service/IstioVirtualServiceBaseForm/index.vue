<template>
  <v-flex>
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
    >
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />
      <BaseSubTitle title="istio虚拟服务定义" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="obj.metadata.name"
              class="my-0"
              required
              label="虚拟服务名称"
              :rules="objRules.nameRule"
              :readonly="edit"
            />
          </v-col>
          <v-col cols="6">
            <v-autocomplete
              v-model="obj.spec.gateways"
              color="primary"
              :items="gateways"
              multiple
              label="网关"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
            >
              <template #selection="{ item }">
                <v-chip
                  color="primary"
                  small
                  class="mx-1"
                >
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="12">
            <v-combobox
              v-model="hosts"
              hide-no-data
              :items="[]"
              :search-input.sync="hostText"
              multiple
              small-chips
              height="32"
              label="hosts(回车)"
              @change="onHostChange"
              @keydown.13="createHost"
            >
              <template #selection="{ item }">
                <v-chip
                  small
                  color="primary"
                  class="pa-1"
                >
                  <span>
                    {{ item.text }}
                  </span>
                  <v-icon
                    small
                    @click="removeHost(item)"
                  >
                    mdi-close
                  </v-icon>
                </v-chip>
              </template>
            </v-combobox>
          </v-col>
          <v-col
            v-if="obj.spec.exportTo"
            cols="12"
          >
            <v-combobox
              v-model="exportTo"
              hide-no-data
              :items="[]"
              :search-input.sync="exportToText"
              multiple
              small-chips
              height="32"
              label="exportTo(回车)"
              @change="onExportToChange"
              @keydown.13="createExportTo"
            >
              <template #selection="{ item }">
                <v-chip
                  small
                  color="primary"
                  class="pa-1"
                >
                  <span>
                    {{ item.text }}
                  </span>
                  <v-icon
                    small
                    @click="removeExportTo(item)"
                  >
                    mdi-close
                  </v-icon>
                </v-chip>
              </template>
            </v-combobox>
          </v-col>
        </v-row>
      </v-card-text>

      <template v-if="Object.prototype.hasOwnProperty.call(obj.spec, 'http')">
        <HttpForm
          ref="httpForm"
          :data="obj.spec.http"
          @addData="addHttpData"
          @closeOverlay="closeExpand"
        />
        <BaseSubTitle title="http流量配置" />
        <v-card-text class="pa-2">
          <HttpItem
            :http="obj.spec.http"
            @updateHttp="updateHttp"
            @removeHttp="removeHttp"
            @expandCard="expandHttpCard"
          />
        </v-card-text>
      </template>

      <template v-if="Object.prototype.hasOwnProperty.call(obj.spec, 'tcp')">
        <TcpForm
          ref="tcpForm"
          :data="obj.spec.tcp"
          @addData="addTcpData"
          @closeOverlay="closeExpand"
        />
        <BaseSubTitle title="tcp流量配置" />
        <v-card-text class="pa-2">
          <TcpItem
            :tcp="obj.spec.tcp"
            @updateTcp="updateTcp"
            @removeTcp="removeTcp"
            @expandCard="expandTcpCard"
          />
        </v-card-text>
      </template>

      <template v-if="Object.prototype.hasOwnProperty.call(obj.spec, 'tls')">
        <TLSForm
          ref="tlsForm"
          :data="obj.spec.tls"
          @addData="addTLSData"
          @closeOverlay="closeExpand"
        />
        <BaseSubTitle title="tls流量配置" />
        <v-card-text class="pa-2">
          <TLSItem
            :tls="obj.spec.tls"
            @updateTLS="updateTLS"
            @removeTLS="removeTLS"
            @expandCard="expandTLSCard"
          />
        </v-card-text>
      </template>
    </v-form>
  </v-flex>
</template>

<script>
import { mapState } from 'vuex'
import { getIstioGatewayList } from '@/api'
import HttpItem from './HttpItem'
import HttpForm from './HttpForm'
import TcpItem from './TcpItem'
import TcpForm from './TcpForm'
import TLSItem from './TLSItem'
import TLSForm from './TLSForm'
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'
import { k8sName, required } from '@/utils/rules'

export default {
  name: 'IstioVirtualServiceBaseForm',
  components: {
    HttpItem,
    HttpForm,
    TcpItem,
    TcpForm,
    TLSItem,
    TLSForm,
  },
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
    gateways: [],
    obj: {
      apiVersion: 'networking.istio.io/v1beta1',
      kind: 'VirtualService',
      metadata: {
        name: '',
        namespace: null,
      },
      spec: {
        hosts: [],
        gateways: [],
        exportTo: [],
        http: [],
        tls: [],
        tcp: [],
      },
    },
    exportTo: [],
    exportToText: '',
    hosts: [],
    hostText: '',
  }),
  computed: {
    ...mapState(['EnvironmentFilter']),
    objRules() {
      return {
        nameRule: [
          required,
          k8sName,
        ],
      }
    },
  },
  watch: {
    item() {
      this.$nextTick(() => {
        this.obj = deepCopy(this.item)
        this.obj.metadata.namespace = this.EnvironmentFilter.namespace
        this.loaddata()
      })
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.obj.metadata.namespace = this.EnvironmentFilter.namespace
      this.loaddata()
      this.istioGatewayList()
    })
  },
  methods: {
    loaddata() {
      if (this.obj.spec.hosts) {
        this.obj.spec.hosts.forEach((h, index) => {
          this.hosts.push({
            text: h,
            value: index,
          })
        })
      }
      if (this.obj.spec.exportTo) {
        this.obj.spec.exportTo.forEach((e, index) => {
          this.exportTo.push({
            text: e,
            value: index,
          })
        })
      }
    },
    async istioGatewayList() {
      const data = await getIstioGatewayList(
        this.EnvironmentFilter.cluster,
        this.EnvironmentFilter.namespace,
        {
          size: 1000,
          noprocessing: true,
        },
      )
      this.gateways = data.List
      this.gateways.forEach((v) => {
        v.text = v.metadata.name
        v.value = v.metadata.name
      })
    },
    onExportToChange() {
      const exportTo = this.exportTo.filter((to) => {
        return to !== '' && typeof to === 'object'
      })
      this.exportTo = exportTo
      this.obj.spec.exportTo = exportTo.map((to) => {
        return to.text
      })
    },
    createExportTo() {
      if (!this.exportToText) return
      const index = this.exportTo.length
      this.exportTo.push({
        text: this.exportToText,
        value: index,
      })
      this.obj.spec.exportTo.push(this.exportToText)
      this.exportToText = ''
    },
    removeExportTo(item) {
      const exportTo = this.exportTo.filter((to) => {
        return to.value !== item.value
      })
      this.exportTo = exportTo
      const index = this.obj.spec.exportTo.indexOf(item.text)
      this.obj.spec.exportTo.splice(index, 1)
    },

    onHostChange() {
      const hosts = this.hosts.filter((host) => {
        return host !== '' && typeof host === 'object'
      })
      this.hosts = hosts
      this.obj.spec.hosts = hosts.map((host) => {
        return host.text
      })
    },
    createHost() {
      if (!this.hostText) return
      const index = this.hosts.length
      this.hosts.push({
        text: this.hostText,
        value: index,
      })
      this.obj.spec.hosts.push(this.hostText)
      this.hostText = ''
    },
    removeHost(item) {
      const hosts = this.hosts.filter((host) => {
        return host.value !== item.value
      })
      this.hosts = hosts
      const index = this.obj.spec.hosts.indexOf(item.text)
      this.obj.spec.hosts.splice(index, 1)
    },

    addTLSData(data) {
      this.obj.spec.tls = data
      this.$refs.tlsForm.closeCard()
    },
    updateTLS(index) {
      const tls = this.obj.spec.tls[index]
      const data = { index: index, ...tls }
      this.$nextTick(() => {
        this.$refs.tlsForm.init(data)
        this.expand = true
      })
    },
    removeTLS(index) {
      this.$delete(this.obj.spec.tls, index)
    },
    expandTLSCard() {
      this.$nextTick(() => {
        this.$refs.tlsForm.init()
        this.$refs.tlsForm.expandCard()
        this.expand = true
      })
    },

    addTcpData(data) {
      this.obj.spec.tcp = data
      this.$refs.tcpForm.closeCard()
    },
    updateTcp(index) {
      const tcp = this.obj.spec.tcp[index]
      const data = { index: index, ...tcp }
      this.$nextTick(() => {
        this.$refs.tcpForm.init(data)
        this.expand = true
      })
    },
    removeTcp(index) {
      this.$delete(this.obj.spec.tcp, index)
    },
    expandTcpCard() {
      this.$nextTick(() => {
        this.$refs.tcpForm.init()
        this.$refs.tcpForm.expandCard()
        this.expand = true
      })
    },

    addHttpData(data) {
      this.obj.spec.http = data
      this.$refs.httpForm.closeCard()
    },
    updateHttp(index) {
      const http = this.obj.spec.http[index]
      const data = { index: index, ...http }
      this.$nextTick(() => {
        this.$refs.httpForm.init(data)
        this.expand = true
      })
    },
    removeHttp(index) {
      this.$delete(this.obj.spec.http, index)
    },
    expandHttpCard() {
      this.$nextTick(() => {
        this.$refs.httpForm.init()
        this.$refs.httpForm.expandCard()
        this.expand = true
      })
    },
    closeExpand() {
      this.expand = false
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      if (this.$refs.httpForm) this.$refs.httpForm.closeCard()
      if (this.$refs.tcpForm) this.$refs.tcpForm.closeCard()
      if (this.$refs.tlsForm) this.$refs.tlsForm.closeCard()
      this.exportTo = []
      this.hosts = []
      this.$refs.form.reset()
    },
    // eslint-disable-next-line vue/no-unused-properties
    setData(data) {
      this.obj = data
    },
  },
}
</script>
