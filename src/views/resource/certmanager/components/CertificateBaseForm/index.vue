<template>
  <v-flex>
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
      @submit.prevent
    >
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />
      <BaseSubTitle title="证书定义" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="obj.metadata.name"
              class="my-0"
              required
              label="名称"
              :rules="objRules.nameRule"
              :readonly="edit"
              @keyup="onCertificateNameInput"
            />
          </v-col>
          <v-col
            v-if="AdminViewport"
            cols="6"
          >
            <v-autocomplete
              v-model="obj.metadata.namespace"
              color="primary"
              :items="m_select_namespaceItems"
              :rules="objRules.namespaceRule"
              :readonly="edit"
              label="命名空间"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
              @change="onNamespaceChange"
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
          <v-col cols="6">
            <v-autocomplete
              v-model="obj.spec.issuerRef.name"
              color="primary"
              :items="m_select_issuerItems"
              :rules="objRules.issuerRule"
              label="颁发机构"
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
          <v-col cols="6">
            <v-autocomplete
              v-model="obj.spec.duration"
              color="primary"
              :items="durationItems"
              :rules="objRules.durationRule"
              label="证书有效期"
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
          <v-col cols="6">
            <v-switch
              v-model="renew"
              class="mt-4"
              label="自动续签"
              @change="onRenewChange"
            />
          </v-col>
          <v-col cols="12">
            <v-autocomplete
              v-model="obj.spec.usages"
              :items="keyUsage"
              hide-selected
              label="证书用途"
              class="my-0"
              multiple
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
      <BaseSubTitle title="授信域名" />
      <DnsNameForm
        ref="dnsNameForm"
        @addData="addData"
        @updateData="updateData"
        @closeOverlay="closeExpand"
      />
      <DnsNameItem
        :items="obj.spec.dnsNames"
        @expandCard="expandCard"
        @removeConfig="removeConfig"
        @updateConfig="updateConfig"
      />
    </v-form>
  </v-flex>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import DnsNameForm from './DnsNameForm'
import DnsNameItem from './DnsNameItem'
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'
import { k8sName, required } from '@/utils/rules'

export default {
  name: 'CertificateBaseForm',
  components: {
    DnsNameForm,
    DnsNameItem,
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
    obj: {
      apiVersion: 'cert-manager.io/v1',
      kind: 'Certificate',
      metadata: {
        name: '',
        namespace: null,
      },
      spec: {
        duration: '8760h0m0s',
        renewBefore: '360h0m0s',
        secretName: '',
        dnsNames: [],
        usages: [],
        issuerRef: {
          kind: 'Issuer',
          name: '',
        },
      },
    },
    renew: true,
    durationItems: [
      { text: '3个月', value: '2160h0m0s' },
      { text: '6个月', value: '4320h0m0s' },
      { text: '1年', value: '8760h0m0s' },
      { text: '2年', value: '17520h0m0s' },
      { text: '5年', value: '43800h0m0s' },
      { text: '10年', value: '87600h0m0s' },
    ],
    keyUsage: [
      { text: 'signing', value: 'signing' },
      { text: 'digital signature', value: 'digital signature' },
      { text: 'server auth', value: 'server auth' },
      { text: 'client auth', value: 'client auth' },
      { text: 'content commitment', value: 'content commitment' },
      { text: 'key encipherment', value: 'key encipherment' },
      { text: 'key agreement', value: 'key agreement' },
      { text: 'data encipherment', value: 'data encipherment' },
      { text: 'cert sign', value: 'cert sign' },
      { text: 'crl sign', value: 'crl sign' },
      { text: 'encipher only', value: 'encipher only' },
      { text: 'decipher only', value: 'decipher only' },
      { text: 'any', value: 'any' },
      { text: 'code signing', value: 'code signing' },
      { text: 'email protection', value: 'email protection' },
      { text: 's/mime', value: 's/mime' },
      { text: 'ipsec end system', value: 'ipsec end system' },
      { text: 'ipsec tunnel', value: 'ipsec tunnel' },
      { text: 'ipsec user', value: 'ipsec user' },
      { text: 'timestamping', value: 'timestamping' },
      { text: 'ocsp signing', value: 'ocsp signing' },
      { text: 'microsoft sgc', value: 'microsoft sgc' },
      { text: 'netscape sgc', value: 'netscape sgc' },
    ],
  }),
  computed: {
    ...mapState(['Admin', 'AdminViewport']),
    ...mapGetters(['Cluster']),
    objRules() {
      return {
        nameRule: [
          required,
          k8sName,
        ],
        namespaceRule: [required],
        issuerRule: [required],
        durationRule: [required],
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
    loadData(cover = false) {
      this.$nextTick(() => {
        if (cover) {
          this.obj = deepCopy(this.item)
        } else {
          if (this.AdminViewport) {
            this.m_select_namespaceSelectData(this.ThisCluster)
          } else {
            this.obj.metadata.namespace = this.ThisNamespace
          }
        }
        if (this.obj.metadata.namespace) {
          this.m_select_issuerSelectData(this.ThisCluster, this.obj.metadata.namespace)
        }
      })
    },
    onRenewChange() {
      if (this.renew) {
        this.obj.spec.renewBefore = '360h0m0s'
      } else {
        this.obj.spec.renewBefore = ''
      }
    },
    onNamespaceChange() {
      this.m_select_issuerSelectData(this.ThisCluster, this.obj.metadata.namespace)
    },
    expandCard(formComponent) {
      this.$nextTick(() => {
        this.$refs[formComponent].expand = true
        this.expand = true
      })
    },
    onCertificateNameInput() {
      this.obj.spec.secretName = this.obj.metadata.name
    },
    closeExpand() {
      this.expand = false
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs.form.resetValidation()
      this.obj = deepCopy(this.$options.data().obj)
    },
    addData(type, config) {
      switch (type) {
        case 'DnsName':
          this.obj.spec.dnsNames.push(config)
          break
      }
    },
    updateData(type, config, index) {
      switch (type) {
        case 'DnsName':
          this.$set(this.obj.spec.dnsNames, index, config)
          break
      }
    },
    removeConfig(type, index) {
      switch (type) {
        case 'DnsName':
          this.$delete(this.obj.spec.dnsNames, index)
          break
      }
    },
    updateConfig(type, index) {
      switch (type) {
        case 'DnsName':
          this.$refs.dnsNameForm.expandCard()
          this.$refs.dnsNameForm.init(this.obj.spec.dnsNames, index)
          break
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    setData(data) {
      this.obj = data
    },
  },
}
</script>
