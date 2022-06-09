<template>
  <v-flex>
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
      @submit.prevent
    >
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />
      <BaseSubTitle title="颁发机构定义" />
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
              @keyup="onIssuerNameInput"
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
              @focus="m_select_namespaceSelectData(ThisCluster)"
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
              v-model="issuer"
              color="primary"
              :items="issuerItems"
              :rules="objRules.issuerRule"
              label="机构类型"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
              @change="onIssuerChange"
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
        <v-row v-if="issuer === 'acme'">
          <v-col cols="6">
            <v-autocomplete
              v-model="obj.spec.acme.server"
              color="primary"
              :items="serverItems"
              :rules="objRules.serverRule"
              :search-input.sync="serverText"
              label="Server"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
              @keyup.enter="createServer"
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
              v-model="obj.spec.acme.solvers[0].http01.ingress.name"
              color="primary"
              :items="ingressItems"
              :rules="objRules.ingressRule"
              label="关联ingress名称"
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
        </v-row>
      </v-card-text>
    </v-form>
  </v-flex>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getIngressList } from '@/api'
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'
import { k8sName, required } from '@/utils/rules'

export default {
  name: 'IssuerBaseForm',
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
      kind: 'Issuer',
      metadata: {
        name: '',
        namespace: null,
      },
      spec: {
        selfSigned: {},
      },
    },
    issuer: 'selfSigned',
    issuerItems: [
      { text: 'SelfSigned', value: 'selfSigned' },
      { text: 'Let’s Encrypt', value: 'acme' },
    ],
    serverText: '',
    serverItems: [
      {
        text: 'https://acme-staging-v02.api.letsencrypt.org/directory',
        value: 'https://acme-staging-v02.api.letsencrypt.org/directory',
      },
      {
        text: 'https://acme-v02.api.letsencrypt.org/directory',
        value: 'https://acme-v02.api.letsencrypt.org/directory',
      },
      {
        text: 'https://acme-staging.api.letsencrypt.org/directory',
        value: 'https://acme-staging.api.letsencrypt.org/directory',
      },
    ],
    ingressItems: [],
  }),
  computed: {
    ...mapState(['Admin', 'AdminViewport', 'ApiResources']),
    ...mapGetters(['Cluster']),
    objRules() {
      return {
        nameRule: [
          required,
          k8sName,
        ],
        namespaceRule: [required],
        issuerRule: [required],
        serverRule: [required],
        ingressRule: [required],
      }
    },
  },
  watch: {
    item: {
      handler() {
        this.obj.apiVersion = this.ApiResources['issuer'] || 'cert-manager.io/v1'
        this.loadData()
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    loadData() {
      this.$nextTick(() => {
        if (this.item) { this.obj = deepCopy(this.item) }
        if (this.obj.spec.acme) {
          this.issuer = 'acme'
          if (
            !this.serverItems.find((s) => {
              return s.value === this.obj.spec.acme.server
            })
          ) {
            this.serverItems.push({
              text: this.obj.spec.acme.server,
              value: this.obj.spec.acme.server,
            })
          }
        }

        if (this.AdminViewport) {
          this.m_select_namespaceSelectData(this.ThisCluster)
        } else {
          this.obj.metadata.namespace = this.ThisNamespace
        }

        if (this.obj.metadata.namespace) this.ingressList()
      })
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.issuer = 'selfSigned'
      this.$refs.form.resetValidation()
      this.obj = deepCopy(this.$options.data().obj)
    },
    async ingressList() {
      const data = await getIngressList(
        this.ThisCluster,
        this.obj.metadata.namespace,
        {
          size: 1000,
        },
      )
      this.ingressItems = []
      data.List.forEach((ing) => {
        this.ingressItems.push({
          text: ing.metadata.name,
          value: ing.metadata.name,
        })
      })
    },
    createServer() {
      if (
        !this.serverItems.find((v) => {
          return v.value === this.serverText
        })
      ) {
        this.serverItems.push({
          text: this.serverText,
          value: this.serverText,
        })
      }
      this.obj.spec.acme.server = this.serverText
      this.serverText = ''
    },
    onNamespaceChange() {
      this.ingressList()
    },
    onIssuerNameInput() {
      if (this.obj.spec.acme) {
        this.obj.spec.acme.privateKeySecretRef.name = this.obj.metadata.name
      }
    },
    onIssuerChange() {
      if (this.issuer === 'selfSigned') {
        this.obj.spec.selfSigned = {}
        this.$delete(this.obj.spec, 'acme')
      } else if (this.issuer === 'acme') {
        this.obj.spec.acme = {
          server: '',
          privateKeySecretRef: {
            name: this.obj.metadata.name,
          },
          solvers: [
            {
              http01: {
                ingress: { name: '' },
              },
            },
          ],
        }
        this.$delete(this.obj.spec, 'selfSigned')
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    setData(data) {
      this.obj = data
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
