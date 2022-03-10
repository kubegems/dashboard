<template>
  <v-flex>
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
      @submit.prevent
    >
      <v-flex :class="expand ? 'kubegems__overlay' : ''" />
      <BaseSubTitle title="密钥定义" />
      <v-card-text class="pa-2">
        <v-row v-if="manifest">
          <v-col cols="6">
            <v-autocomplete
              v-model="resourceKind"
              color="primary"
              :items="kinds"
              :rules="objRules.kindRule"
              :readonly="edit"
              label="资源"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
              @change="onKindChange"
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
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="obj.metadata.name"
              class="my-0"
              required
              label="名称"
              :rules="objRules.nameRule"
              :readonly="edit"
            />
          </v-col>
          <v-col cols="6">
            <v-autocomplete
              v-model="obj.type"
              color="primary"
              :items="types"
              :rules="objRules.typeRule"
              label="密钥类型"
              hide-selected
              class="my-0"
              no-data-text="暂无可选数据"
              @update:search-input="syncInput"
              @keydown.enter="customType"
              @click:clear="clearType"
              @change="onTypeChange"
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
          <v-col
            v-if="AdminViewport && !manifest"
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
              @focus="onNamespaceSelectFocus(ThisCluster)"
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

      <component
        :is="formComponent"
        :ref="formComponent"
        :data="obj.data"
        @addData="addData"
        @closeOverlay="closeExpand"
      />
      <BaseSubTitle title="密钥项" />
      <v-card-text class="pa-2">
        <SecretDataItem
          :data="obj.data"
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
import SecretDataItem from './SecretDataItem'
import SecretDataForm from './SecretDataForm'
import SecretTlsForm from './SecretTlsForm'
import SecretDockerconfigForm from './SecretDockerconfigForm'
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'
import { k8sName, required } from '@/utils/rules'

import { Base64 } from 'js-base64'

export default {
  name: 'SecretBaseForm',
  components: {
    SecretDataItem,
    SecretDataForm,
    SecretTlsForm,
    SecretDockerconfigForm,
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
    kind: {
      type: String,
      default: () => 'Secret',
    },
    manifest: {
      type: Boolean,
      default: () => false,
    },
    kinds: {
      type: Array,
      default: () => [],
    },
    app: {
      type: Object,
      default: () => {},
    },
  },
  data: () => ({
    valid: false,
    expand: false,
    resourceKind: '',
    types: [
      { text: '默认', value: 'Opaque' },
      { text: 'TLS', value: 'kubernetes.io/tls' },
      { text: '镜像仓库', value: 'kubernetes.io/dockerconfigjson' },
    ],
    obj: {
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: {
        name: '',
        namespace: null,
      },
      data: {},
      type: 'Opaque',
    },
    input: '',
    formComponent: 'SecretDataForm',
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
        typeRule: [required],
        kindRule: [required],
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
          if (!this.item) {
            this.obj = this.$options.data().obj
            this.$refs.form.resetValidation()
          } else {
            this.obj = deepCopy(this.item)
          }
        } else {
          if (!this.manifest) {
            if (this.AdminViewport) {
              this.m_select_namespaceSelectData(this.ThisCluster)
            } else {
              this.obj.metadata.namespace = this.ThisNamespace
            }
          } else {
            this.obj.metadata.name = `${this.app.ApplicationName}`
          }
        }
        this.resourceKind = this.kind
        this.obj.kind = this.kind
        if (
          !this.types.find((t) => {
            return t.value === this.obj.type
          })
        ) {
          this.types.push({ text: this.obj.type, value: this.obj.type })
        }
      })
    },
    syncInput(input) {
      this.input = input
    },
    customType() {
      this.types.push({ text: this.input, value: this.input })
      this.obj.type = this.input
    },
    onTypeChange() {
      if (this.obj.type === 'Opaque') {
        this.formComponent = 'SecretDataForm'
      } else if (this.obj.type === 'kubernetes.io/tls') {
        this.formComponent = 'SecretTlsForm'
      } else if (this.obj.type === 'kubernetes.io/dockerconfigjson') {
        this.formComponent = 'SecretDockerconfigForm'
      } else {
        this.formComponent = 'SecretDataForm'
      }
    },
    clearType() {
      this.types = [
        { text: '默认', value: 'Opaque' },
        { text: 'TLS', value: 'kubernetes.io/tls' },
        { text: '镜像仓库', value: 'kubernetes.io/dockerconfigjson' },
      ]
      this.obj.type = ''
    },
    addData(data) {
      this.obj.data = data
      this.$refs[this.formComponent].closeCard()
    },
    updateData(key) {
      if (this.obj.type === 'Opaque') {
        const data = { key: key, value: Base64.decode(this.obj.data[key]) }
        this.formComponent = 'SecretDataForm'
        this.$nextTick(() => {
          this.$refs[this.formComponent].init(data)
        })
      } else if (this.obj.type === 'kubernetes.io/tls') {
        const tls = {}
        for (const key in this.obj.data) {
          tls[key] = Base64.decode(this.obj.data[key])
        }
        this.formComponent = 'SecretTlsForm'
        this.$nextTick(() => {
          this.$refs[this.formComponent].init(tls)
        })
      } else if (this.obj.type === 'kubernetes.io/dockerconfigjson') {
        const dockerconfigstr = Base64.decode(
          this.obj.data['.dockerconfigjson'],
        )
        try {
          const dockerconfig = JSON.parse(dockerconfigstr)
          for (const address in dockerconfig.auths) {
            const config = {
              username: dockerconfig.auths[address].username,
              password: dockerconfig.auths[address].password,
              email: dockerconfig.auths[address].email,
              address: address,
            }
            this.formComponent = 'SecretDockerconfigForm'
            this.$nextTick(() => {
              this.$refs[this.formComponent].init(config)
            })
          }
        } catch (e) {
          this.$store.commit('SET_SNACKBAR', {
            text: '无法解析数据',
            color: 'warning',
          })
        }
      } else {
        const data = { key: key, value: Base64.decode(this.obj.data[key]) }
        this.formComponent = 'SecretDataForm'
        this.$nextTick(() => {
          this.$refs[this.formComponent].init(data)
        })
      }
      this.expand = true
    },
    removeData(key) {
      this.$delete(this.obj.data, key)
    },
    expandCard() {
      if (this.obj.type === 'Opaque') {
        this.formComponent = 'SecretDataForm'
      } else if (this.obj.type === 'kubernetes.io/tls') {
        this.formComponent = 'SecretTlsForm'
      } else if (this.obj.type === 'kubernetes.io/dockerconfigjson') {
        this.formComponent = 'SecretDockerconfigForm'
      } else {
        this.formComponent = 'SecretDataForm'
      }
      this.$nextTick(() => {
        this.$refs[this.formComponent].expand = true
        this.expand = true
      })
    },
    closeExpand() {
      this.expand = false
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs[this.formComponent].closeCard()
      this.$refs.form.reset()
    },
    // eslint-disable-next-line vue/no-unused-properties
    init(data) {
      this.$nextTick(() => {
        this.obj = deepCopy(data)
      })
    },
    // eslint-disable-next-line vue/no-unused-properties
    back(data) {
      this.$nextTick(() => {
        this.obj = deepCopy(data)
      })
    },
    // eslint-disable-next-line vue/no-unused-properties
    checkSaved() {
      if (this.$refs[this.formComponent].expand) {
        return !this.$refs[this.formComponent].expand
      }
      return true
    },
    onKindChange() {
      this.$emit('change', this.resourceKind)
    },
    // eslint-disable-next-line vue/no-unused-properties
    setData(data) {
      this.obj = data
    },
    onNamespaceSelectFocus(clusterName) {
      this.m_select_namespaceSelectData(clusterName)
    },
  },
}
</script>
