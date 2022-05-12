<template>
  <v-form
    v-model="valid"
    lazy-validation
    class="my-2"
    @submit.prevent
  >
    <v-flex :class="expand ? 'kubegems__overlay' : ''" />
    <v-expand-transition>
      <v-card
        v-show="expand"
        class="my-2 pa-2 kubegems__expand-transition"
        :elevation="4"
      >
        <v-card-text class="pa-0">
          <v-sheet class="pt-2 px-2">
            <v-flex
              class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width"
            >
              <span>变量类型</span>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-autocomplete
                v-model="env"
                :items="envTypes"
                color="primary"
                label="类型"
                hide-selected
                class="my-0"
                no-data-text="暂无可选数据"
                @change="onEnvTypeChange"
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
            </v-flex>
            <div class="kubegems__clear-float" />
          </v-sheet>
          <v-form
            ref="form"
            v-model="valid"
            lazy-validation
            @submit.prevent
          >
            <v-sheet class="px-2">
              <v-flex
                class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width"
              >
                <span />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.name"
                  class="my-0"
                  required
                  label="名称"
                  :rules="objRules.nameRule"
                />
              </v-flex>
              <v-flex v-if="env === 'kv'">
                <v-flex class="float-left ml-2 kubegems__form-width">
                  <v-text-field
                    v-model="obj.value"
                    class="my-0"
                    required
                    label="值"
                    :rules="objRules.valueRule"
                  />
                </v-flex>
              </v-flex>
              <v-flex v-else-if="env === 'secret' || env === 'configmap'">
                <v-flex class="float-left ml-2 kubegems__form-width">
                  <v-autocomplete
                    v-model="obj.fromName"
                    :items="items"
                    color="primary"
                    :label="env === 'secret' ? '密钥' : '配置'"
                    hide-selected
                    class="my-0"
                    no-data-text="暂无可选数据"
                    :rules="objRules.fromNameRule"
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
                </v-flex>
                <v-flex
                  class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width"
                >
                  <span />
                </v-flex>
                <v-flex class="float-left ml-2 kubegems__form-width">
                  <v-autocomplete
                    v-model="obj.value"
                    :items="keys"
                    color="primary"
                    label="键"
                    hide-selected
                    class="my-0"
                    no-data-text="暂无可选数据"
                    :rules="objRules.valueRule"
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
                </v-flex>
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
            <v-sheet class="px-2">
              <v-flex
                class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width"
              >
                <span />
              </v-flex>
              <v-flex v-if="env === 'downward'">
                <v-flex class="float-left ml-2 kubegems__form-width">
                  <v-autocomplete
                    v-model="obj.fromName"
                    :items="sources"
                    color="primary"
                    label="源"
                    hide-selected
                    class="my-0"
                    no-data-text="暂无可选数据"
                    :rules="objRules.fromNameRule"
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
                </v-flex>
                <template v-if="obj.fromName === 'Container'">
                  <v-flex class="float-left ml-2 kubegems__form-width">
                    <v-text-field
                      v-model="obj.containerName"
                      class="my-0"
                      required
                      label="容器"
                      :rules="objRules.containerNameRule"
                    />
                  </v-flex>
                  <v-flex
                    class="float-left text-subtitle-2 py-1 primary--text kubegems__min-width"
                  >
                    <span />
                  </v-flex>
                  <v-flex class="float-left ml-2 kubegems__form-width">
                    <v-text-field
                      v-model="obj.value"
                      class="my-0"
                      required
                      label="resource"
                      :rules="objRules.valueRule"
                    />
                  </v-flex>
                </template>
                <template v-else-if="obj.fromName === 'Pod'">
                  <v-flex class="float-left ml-2 kubegems__form-width">
                    <v-text-field
                      v-model="obj.value"
                      class="my-0"
                      required
                      label="fieldPath"
                      :rules="objRules.valueRule"
                    />
                  </v-flex>
                </template>
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-0">
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
    <v-sheet
      v-for="(item, index) in containerCopy && containerCopy.env
        ? containerCopy.env
        : []"
      :key="index"
      class="grey lighten-4 rounded ma-2"
    >
      <v-list-item two-line>
        <v-list-item-content
          v-if="!item.valueFrom"
          class="py-2"
        >
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__middle-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  <span> 键值对 </span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  类型
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__container-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  <span>
                    {{ item.name }}
                  </span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  名称
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__container-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  <span>
                    {{ item.value }}
                  </span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  值
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
        <v-list-item-content
          v-else-if="item.valueFrom && item.valueFrom.secretKeyRef"
          class="py-2"
        >
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__middle-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  <span> 密钥 </span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  类型
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__container-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  <span>
                    {{ item.name }}
                  </span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  名称
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__container-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  <span>
                    {{ item.valueFrom.secretKeyRef.name }}
                  </span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  密钥
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__container-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  <span>
                    {{ item.valueFrom.secretKeyRef.key }}
                  </span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  键
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
        <v-list-item-content
          v-else-if="item.valueFrom && item.valueFrom.configMapKeyRef"
          class="py-2"
        >
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__middle-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  <span> 配置 </span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  类型
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__container-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  <span>
                    {{ item.name }}
                  </span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  名称
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__container-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  <span>
                    {{ item.valueFrom.configMapKeyRef.name }}
                  </span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  密钥
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__container-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  <span>
                    {{ item.valueFrom.configMapKeyRef.key }}
                  </span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  键
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
        <v-list-item-content
          v-else-if="item.valueFrom && item.valueFrom.fieldRef"
          class="py-2"
        >
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__middle-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  <span> Downward API </span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  类型
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__container-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  <span>
                    {{ item.name }}
                  </span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  名称
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__container-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  <span> Pod </span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  方式
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__container-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  <span>
                    {{ item.valueFrom.fieldRef.fieldPath }}
                  </span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  fieldPath
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
        <v-list-item-content
          v-else-if="item.valueFrom && item.valueFrom.resourceFieldRef"
          class="py-2"
        >
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__middle-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  <span> Downward API </span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  类型
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__container-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  <span>
                    {{ item.name }}
                  </span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  名称
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__container-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  <span> Container </span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  方式
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__container-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  <span>
                    {{ item.valueFrom.resourceFieldRef.containerName }}
                  </span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  容器
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              two-line
              class="float-left pa-0 kubegems__container-width"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  <span>
                    {{ item.valueFrom.resourceFieldRef.resource }}
                  </span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  resource
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
        <v-btn
          dark
          text
          fab
          right
          x-small
          color="primary"
          @click="updateData(index)"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          dark
          text
          fab
          right
          x-small
          color="error"
          @click="removeData(index)"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>
    <v-flex class="grey lighten-4 rounded-0 ma-2">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0 text-center">
            <v-btn
              text
              color="primary"
              @click="expandCard"
            >
              <v-icon
                left
                small
              >
                mdi-plus
              </v-icon>
              添加环境变量
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-form>
</template>

<script>
import { getSecretList, getConfigMapList, getAppResourceFileMetas } from '@/api'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'
import { required } from '@/utils/rules'

export default {
  name: 'ContainerEnv',
  mixins: [BaseResource],
  props: {
    container: {
      type: Object,
      default: () => null,
    },
    namespace: {
      type: String,
      default: () => '',
    },
    manifest: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      valid: false,
      expand: false,
      envTypes: [
        { text: '键值对', value: 'kv' },
        { text: '配置', value: 'configmap' },
        { text: '密钥', value: 'secret' },
        { text: 'Downward API', value: 'downward' },
      ],
      sources: [
        { text: '容器', value: 'Container' },
        { text: 'Pod', value: 'Pod' },
      ],
      env: 'kv',
      items: [],
      obj: {
        name: '',
        fromName: '',
        value: '',
        containerName: '',
      },
      containerCopy: null,
    }
  },
  computed: {
    objRules() {
      return {
        nameRule: [required],
        fromNameRule: [required],
        valueRule: [required],
        containerNameRule: [required],
      }
    },
    keys() {
      if (this.env === 'secret') {
        const secret = this.items.find((s) => {
          return s.value === this.obj.fromName
        })
        if (secret) return secret.keys
        return []
      } else if (this.env === 'configmap') {
        const configmap = this.items.find((c) => {
          return c.value === this.obj.fromName
        })
        if (configmap) return configmap.keys
        return []
      }
      return []
    },
  },
  watch: {
    container() {
      if (this.container) this.containerCopy = deepCopy(this.container)
      else this.containerCopy = {}
    },
  },
  mounted() {
    if (this.container) this.containerCopy = deepCopy(this.container)
    else this.containerCopy = {}
  },
  methods: {
    async secretList() {
      let data = {}
      if (this.manifest) {
        data = await getAppResourceFileMetas(
          this.$route.query.tenantid,
          this.$route.query.projectid,
          this.ThisAppEnvironmentID,
          this.$route.params.name,
          {
            kind: 'Secret',
          },
        )
        this.items = data
      } else {
        data = await getSecretList(this.ThisCluster, this.namespace, {
          size: 1000,
        })
        this.items = data.List
      }
      this.items.forEach((v) => {
        v.text = v.secret.metadata.name
        v.value = v.secret.metadata.name
        v.keys = []
        if (v.secret.data) {
          Object.keys(v.secret.data).forEach((d) => {
            v.keys.push({ text: d, value: d })
          })
        }
      })
    },
    async configMapList() {
      let data = {}
      if (this.manifest) {
        data = await getAppResourceFileMetas(
          this.$route.query.tenantid,
          this.$route.query.projectid,
          this.ThisAppEnvironmentID,
          this.$route.params.name,
          {
            kind: 'ConfigMap',
          },
        )
        this.items = data
      } else {
        data = await getConfigMapList(this.ThisCluster, this.namespace, {
          size: 1000,
        })
        this.items = data.List
      }
      this.items.forEach((v) => {
        v.text = v.metadata.name
        v.value = v.metadata.name
        v.keys = []
        if (v.data) {
          Object.keys(v.data).forEach((d) => {
            v.keys.push({ text: d, value: d })
          })
        }
      })
    },
    onEnvTypeChange() {
      if (this.env === 'secret') this.secretList()
      else if (this.env === 'configmap') this.configMapList()
    },
    expandCard() {
      this.expand = true
    },
    closeCard() {
      this.expand = false
      this.$refs.form.reset()
      this.$nextTick(() => {
        this.env = 'kv'
      })
    },
    generatorData() {
      if (this.env === 'kv') {
        return {
          name: this.obj.name,
          value: this.obj.value,
        }
      } else if (this.env === 'secret') {
        return {
          name: this.obj.name,
          valueFrom: {
            secretKeyRef: {
              name: this.obj.fromName,
              key: this.obj.value,
            },
          },
        }
      } else if (this.env === 'configmap') {
        return {
          name: this.obj.name,
          valueFrom: {
            configMapKeyRef: {
              name: this.obj.fromName,
              key: this.obj.value,
            },
          },
        }
      } else if (this.env === 'downward') {
        if (this.obj.fromName === 'Pod') {
          return {
            name: this.obj.name,
            valueFrom: {
              fieldRef: {
                fieldPath: this.obj.value,
              },
            },
          }
        } else if (this.obj.fromName === 'Container') {
          return {
            name: this.obj.name,
            valueFrom: {
              resourceFieldRef: {
                containerName: this.obj.containerName,
                resource: this.obj.value,
              },
            },
          }
        }
      }
      return null
    },
    addData() {
      if (this.$refs.form.validate(true)) {
        if (!this.containerCopy.env) this.$set(this.containerCopy, 'env', [])
        const index = this.containerCopy.env.findIndex((e) => {
          return e.name === this.obj.name
        })
        if (index > -1) {
          this.$set(this.containerCopy.env, index, this.generatorData())
        } else {
          const env = this.containerCopy.env
          env.push(this.generatorData())
          this.$set(this.containerCopy, 'env', env)
        }
        this.$emit('updateComponentData', this.containerCopy)
        this.closeCard()
      }
    },
    removeData(index) {
      this.$delete(this.containerCopy.env, index)
      this.$emit('updateComponentData', this.containerCopy)
    },
    updateData(index) {
      const env = this.containerCopy.env[index]
      if (env.valueFrom) {
        if (env.valueFrom.secretKeyRef) {
          this.env = 'secret'
          this.obj = {
            name: env.name,
            value: env.valueFrom.secretKeyRef.key,
            fromName: env.valueFrom.secretKeyRef.name,
          }
          this.secretList()
        } else if (env.valueFrom.configMapKeyRef) {
          this.env = 'configmap'
          this.obj = {
            name: env.name,
            value: env.valueFrom.configMapKeyRef.key,
            fromName: env.valueFrom.configMapKeyRef.name,
          }
          this.configMapList()
        } else if (env.valueFrom.resourceFieldRef) {
          this.env = 'downward'
          this.obj = {
            name: env.name,
            value: env.valueFrom.resourceFieldRef.resource,
            containerName: env.valueFrom.resourceFieldRef.containerName,
            fromName: 'Container',
          }
        } else if (env.valueFrom.fieldRef) {
          this.env = 'downward'
          this.obj = {
            name: env.name,
            value: env.valueFrom.fieldRef.fieldPath,
            fromName: 'Pod',
          }
        }
      } else {
        this.env = 'kv'
        this.obj = {
          name: env.name,
          value: env.value,
        }
      }
      this.expandCard()
    },
  },
}
</script>
