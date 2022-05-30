<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
    @submit.prevent
  >
    <v-flex :class="expand ? 'kubegems__overlay' : ''" />
    <v-expand-transition>
      <v-card
        v-show="expand"
        class="my-2 pa-2 kubegems__expand-transition"
        :elevation="4"
      >
        <v-card-text class="pa-2">
          <BaseSubTitle title="镜像" />
          <ContainerImageSelect
            ref="containerImageSelect"
            :container="container"
            :type="type"
            :image-pull-secret="imagePullSecret"
            :edit="containerEdit"
            @updateType="updateType"
            @updateRegistry="updateRegistry"
          />

          <BaseSubTitle title="高级配置" />
          <v-tabs
            v-model="tab"
            class="px-2 v-tabs--default"
            height="40"
            fixed-tabs
            @change="onTabChange"
          >
            <v-tab
              v-for="item in tabItems"
              :key="item.value"
            >
              {{ item.text }}
            </v-tab>
          </v-tabs>

          <component
            :is="tabItems[tab].value"
            :ref="tabItems[tab].value"
            :container="container"
            :namespace="obj.metadata.namespace"
            :manifest="manifest"
            @updateComponentData="updateComponentData"
          />
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

    <BaseSubTitle title="容器镜像" />
    <v-card-text class="pa-2">
      <ContainerImageItem
        :containers="obj.spec.template.spec.containers"
        :init-containers="obj.spec.template.spec.initContainers"
        @updateData="updateData"
        @removeData="removeData"
        @expandCard="expandCard"
      />
    </v-card-text>
  </v-form>
</template>

<script>
import ContainerImageItem from './ContainerImageItem'
import ContainerImageSelect from './ContainerImageSelect'
import ContainerResource from './container_section/ContainerResource'
import ContainerSecurityContext from './container_section/ContainerSecurityContext'
import ContainerRunCommand from './container_section/ContainerRunCommand'
import ContainerEnv from './container_section/ContainerEnv'
import ContainerPort from './container_section/ContainerPort'
import ContainerHealthCheck from './container_section/ContainerHealthCheck'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'ContainerImage',
  components: {
    ContainerImageItem,
    ContainerImageSelect,
    ContainerResource,
    ContainerSecurityContext,
    ContainerRunCommand,
    ContainerEnv,
    ContainerPort,
    ContainerHealthCheck,
  },
  props: {
    manifest: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      valid: false,
      obj: {
        metadata: {},
        spec: {
          template: {
            spec: {
              containers: [],
              initContainers: [],
              serviceAccount: 'default',
            },
          },
        },
      },
      expand: false,
      container: null,
      type: 'worker',
      imagePullSecret: 'dockerhub',
      containerEdit: false,
      tab: 0,
      tabItems: [
        { text: '资源限制', value: 'ContainerResource' },
        { text: '容器端口', value: 'ContainerPort' },
        { text: '健康检查', value: 'ContainerHealthCheck' },
        { text: '启动命令', value: 'ContainerRunCommand' },
        { text: '环境变量', value: 'ContainerEnv' },
        { text: '安全设置', value: 'ContainerSecurityContext' },
      ],
    }
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    init(data) {
      this.$nextTick(() => {
        this.obj = this.$_.merge(deepCopy(data), this.obj)
        if (
          this.obj.spec.template.spec.imagePullSecrets &&
          this.obj.spec.template.spec.imagePullSecrets.length > 0
        ) {
          this.imagePullSecret =
            this.obj.spec.template.spec.imagePullSecrets[0].name
        }
      })
    },
    // eslint-disable-next-line vue/no-unused-properties
    back(data) {
      this.$nextTick(() => {
        this.obj = deepCopy(data)
      })
    },
    reset() {
      this.$refs.form.reset()
    },
    onTabChange() {
      this.checkData()
    },
    expandCard(edit = false) {
      this.containerEdit = edit
      if (!edit) {
        this.container = null
      } else {
        this.$refs.containerImageSelect.init()
      }
      const tabsSliderWrappers = document.querySelectorAll(
        '.v-tabs-slider-wrapper',
      )
      if (tabsSliderWrappers.length > 0) {
        tabsSliderWrappers[tabsSliderWrappers.length - 1].style.width = `154px`
      }
      this.expand = true
    },
    closeCard() {
      this.expand = false
      this.$refs.containerImageSelect.reset()
      this.reset()
    },
    generateImagePullSecret() {
      if (this.imagePullSecret === 'dockerhub') {
        this.$delete(this.obj.spec.template.spec, 'imagePullSecrets')
      } else {
        if (this.obj.spec.template.spec.imagePullSecrets) {
          const index = this.obj.spec.template.spec.imagePullSecrets.findIndex(
            (i) => {
              return i.name === this.imagePullSecret
            },
          )
          if (index === -1) {
            const secrets = this.obj.spec.template.spec.imagePullSecrets
            secrets.push({ name: this.imagePullSecret })
            this.$set(this.obj.spec.template.spec, 'imagePullSecrets', secrets)
          }
        } else {
          this.$set(this.obj.spec.template.spec, 'imagePullSecrets', [
            { name: this.imagePullSecret },
          ])
        }
      }
    },
    checkData() {
      let check = true
      this.tabItems.forEach((tab) => {
        if (this.$refs[tab.value]) {
          if (this.$refs[tab.value].expand) {
            if (tab.value === 'ContainerResource') {
              this.$store.commit('SET_SNACKBAR', {
                text: '资源限制数据未保存',
                color: 'warning',
              })
              check = false
              return
            } else if (tab.value === 'ContainerPort') {
              this.$store.commit('SET_SNACKBAR', {
                text: '容器端口数据未保存',
                color: 'warning',
              })
              check = false
              return
            } else if (tab.value === 'ContainerHealthCheck') {
              this.$store.commit('SET_SNACKBAR', {
                text: '健康检查数据未保存',
                color: 'warning',
              })
              check = false
              return
            } else if (tab.value === 'ContainerRunCommand') {
              this.$store.commit('SET_SNACKBAR', {
                text: '启动命令数据未保存',
                color: 'warning',
              })
              check = false
              return
            } else if (tab.value === 'ContainerEnv') {
              this.$store.commit('SET_SNACKBAR', {
                text: '环境变量数据未保存',
                color: 'warning',
              })
              check = false
              return
            } else if (tab.value === 'ContainerSecurityContext') {
              this.$store.commit('SET_SNACKBAR', {
                text: '安全设置数据未保存',
                color: 'warning',
              })
              check = false
              return
            }
          }
        }
      })
      return check
    },
    addData() {
      if (this.checkData()) {
        if (this.$refs.containerImageSelect.$refs.form.validate(true)) {
          if (
            this.updateComponentData(this.$refs.containerImageSelect.obj, false)
          ) {
            this.generateImagePullSecret()
            this.closeCard()
          }
        }
      }
    },
    updateData(index, type) {
      let container = null
      if (type === 'worker') {
        container = this.obj.spec.template.spec.containers[index]
        this.type = 'worker'
      } else {
        container = this.obj.spec.template.spec.initContainers[index]
        this.type = 'init'
      }
      this.container = container
      this.expandCard(true)
    },
    removeData(index, type) {
      if (type === 'worker') {
        this.$delete(this.obj.spec.template.spec.containers, index)
      } else {
        this.$delete(this.obj.spec.template.spec.initContainers, index)
      }
    },
    updateType(data) {
      this.type = data
    },
    updateRegistry(data) {
      this.imagePullSecret = data
    },
    updateComponentData(data, temp = true) {
      if (this.type === 'worker') {
        const indexContainer = this.obj.spec.template.spec.containers.findIndex(
          (c) => {
            return c.name === data.name
          },
        )
        if (indexContainer > -1) {
          this.container = deepCopy(data)
          if (!temp) {
            this.$set(
              this.obj.spec.template.spec.containers,
              indexContainer,
              data,
            )
          }
        } else {
          this.container = deepCopy(data)
          if (!temp) {
            const containers = this.obj.spec.template.spec.containers
            containers.push(deepCopy(data))
            this.$set(this.obj.spec.template.spec, 'containers', containers)
          }
        }
      } else if (this.type === 'init') {
        const indexInitContainer =
          this.obj.spec.template.spec.initContainers.findIndex((c) => {
            return c.name === data.name
          })
        if (indexInitContainer > -1) {
          this.container = deepCopy(data)
          if (!temp) {
            this.$set(
              this.obj.spec.template.spec.initContainers,
              indexInitContainer,
              data,
            )
          }
        } else {
          this.container = deepCopy(data)
          if (!temp) {
            const containers = this.obj.spec.template.spec.initContainers
            containers.push(deepCopy(data))
            this.$set(this.obj.spec.template.spec, 'initContainers', containers)
          }
        }
      }
      return true
    },
  },
}
</script>
