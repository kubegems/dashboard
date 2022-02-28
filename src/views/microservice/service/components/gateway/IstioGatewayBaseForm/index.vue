<template>
  <v-flex>
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
    >
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />
      <BaseSubTitle title="istio网关定义" />
      <v-card-text class="pa-2">
        <v-row>
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
              v-model="ingressgateway"
              color="primary"
              :items="ingressgatewayItems"
              label="selector(网关实例)"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
              :rules="objRules.selectorRule"
              @change="onIngressgatewayChange"
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
        </v-row>
      </v-card-text>

      <ServerForm
        ref="serverForm"
        :data="obj.spec.servers"
        @addData="addServerData"
        @closeOverlay="closeExpand"
      />
      <BaseSubTitle title="服务配置" />
      <v-card-text class="pa-2">
        <ServerItem
          :servers="obj.spec.servers"
          @updateServer="updateServer"
          @removeServer="removeServer"
          @expandCard="expandServerCard"
        />
      </v-card-text>
    </v-form>
  </v-flex>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getIstioGatewayInstanceList } from '@/api'
import ServerItem from './ServerItem'
import ServerForm from './ServerForm'
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'
import { k8sName, required } from '@/utils/rules'

export default {
  name: 'IstioGatewayBaseForm',
  components: {
    ServerItem,
    ServerForm,
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
    ingressgatewayItems: [],
    ingressgateway: null,
    obj: {
      apiVersion: 'networking.istio.io/v1beta1',
      kind: 'Gateway',
      metadata: {
        name: '',
        namespace: null,
      },
      spec: {
        selector: {},
        servers: [],
      },
    },
  }),
  computed: {
    ...mapState(['EnvironmentFilter']),
    ...mapGetters(['VirtualSpace']),
    objRules() {
      return {
        nameRule: [
          required,
          k8sName,
        ],
        selectorRule: [required],
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
      this.istioGatewayInstanceList()
    })
  },
  methods: {
    loaddata() {
      if (this.obj.spec.selector['gems.kubegems.io/istioGateway']) {
        this.ingressgateway =
          this.obj.spec.selector['gems.kubegems.io/istioGateway']
      }
    },
    async istioGatewayInstanceList() {
      const data = await getIstioGatewayInstanceList(
        this.VirtualSpace().ID,
        this.EnvironmentFilter.clusterid,
        {
          noprocessing: true,
        },
      )
      this.ingressgatewayItems = []
      data.forEach((gateway) => {
        this.ingressgatewayItems.push({
          text: gateway.Name,
          value: gateway.Name,
        })
      })
    },
    onIngressgatewayChange() {
      this.obj.spec.selector = {}
      this.obj.spec.selector['gems.kubegems.io/istioGateway'] =
        this.ingressgateway
      this.obj.spec.selector['gems.kubegems.io/virtualSpace'] =
        this.VirtualSpace().VirtualSpaceName
    },
    addServerData(data) {
      this.obj.spec.servers = data
      this.$refs.serverForm.closeCard()
    },
    updateServer(index) {
      const server = this.obj.spec.servers[index]
      const data = { index: index, ...server }
      this.$nextTick(() => {
        this.$refs.serverForm.init(data)
        this.expand = true
      })
    },
    removeServer(index) {
      this.$delete(this.obj.spec.servers, index)
    },
    expandServerCard() {
      this.$nextTick(() => {
        this.$refs.serverForm.expandCard()
        this.expand = true
      })
    },
    closeExpand() {
      this.expand = false
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      if (this.$refs.serverForm) this.$refs.serverForm.closeCard()
      this.$refs.form.reset()
    },
    // eslint-disable-next-line vue/no-unused-properties
    setData(data) {
      this.obj = data
    },
  },
}
</script>
