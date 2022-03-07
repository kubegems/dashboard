<template>
  <FormWizard
    ref="deploy"
    :class="`px-8 pt-8`"
    shape="tab"
    title=""
    subtitle=""
    color="#1e88e5"
    error-color="#e74c3c"
    next-button-text="下一步"
    back-button-text="上一步"
    finish-button-text="部署"
    step-size="sm"
    :start-index="0"
  >
    <TabContent
      :class="`zoom-${Scale.toString().replaceAll(
        '.',
        '-',
      )} kubegems__wizard-tab-content mt-8`"
      title="基本配置"
      icon="ti-info-alt"
      :before-change="validateBaseInfo"
    >
      <v-form
        ref="baseInfoForm"
        v-model="valid"
        lazy-validation
        class="wizard-form-content"
      >
        <v-row>
          <v-col class="my-2">
            <v-text-field
              v-model="obj.AppName"
              class="my-4"
              required
              label="应用名称"
              flat
              :rules="objRules.appNameRules"
              @change="onAppNameChange"
            />
            <v-autocomplete
              v-model="obj.TenantProjectId"
              color="primary"
              :items="tenantProjectSelect"
              :rules="objRules.tenantProjectIdRules"
              label="项目"
              hide-selected
              class="my-4"
              item-text="text"
              no-data-text="暂无可选数据"
              :menu-props="{
                bottom: true,
                left: true,
                origin: `top center`,
                transition: `scale-transition`,
              }"
              @focus="onTenantProjectSelectFocus"
            >
              <template #selection="{ item }">
                <v-chip
                  color="primary"
                  small
                >
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col class="my-2">
            <v-autocomplete
              v-model="obj.selectVersion"
              :menu-props="{
                bottom: true,
                left: true,
                origin: `top center`,
                transition: `scale-transition`,
              }"
              :items="versions"
              color="primary"
              :rules="objRules.versionRules"
              label="版本"
              hide-selected
              class="my-4"
              no-data-text="暂无可选数据"
              @change="onAppVersionChange"
            >
              <template #selection="{ item }">
                <v-chip
                  color="primary"
                  small
                >
                  {{ item }}
                </v-chip>
              </template>
            </v-autocomplete>

            <v-autocomplete
              v-model="obj.EnvironmentId"
              color="primary"
              :items="projectEnvironmentSelect"
              :rules="objRules.environmentIdRules"
              label="环境"
              hide-selected
              class="my-4"
              no-data-text="暂无可选数据"
              :menu-props="{
                bottom: true,
                left: true,
                origin: `top center`,
                transition: `scale-transition`,
              }"
              @focus="onEnvSelectFocus"
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
      </v-form>
    </TabContent>
    <TabContent
      title="详细配置"
      icon="ti-settings"
      :lazy="false"
      :class="`zoom-${Scale.toString().replaceAll(
        '.',
        '-',
      )} kubegems__wizard-tab-content mt-12`"
    >
      <v-tabs
        v-model="tab"
        height="40"
        rounded-t
        @change="onTabChange"
      >
        <v-tab
          v-for="item in tabItems"
          :key="item.value"
        >
          {{ item.text }}
          <Tips
            v-if="tab === 0 && selectRepo !== 'gemscloud'"
            msg="第三方仓库,建议使用values.yaml配置"
            class="mx-1"
          />
        </v-tab>
      </v-tabs>
      <div
        v-if="tab === 0"
        class="py-2"
      >
        <JsonSchema
          ref="jsonSchema"
          :app-values="appValues"
          :params="params"
          :cluster-name="clusterName"
          class="mt-0"
          @changeBasicFormParam="changeBasicFormParam"
        />
      </div>
      <div
        v-else
        class="py-2"
      >
        <ACEEditor
          v-model="appValuesYaml"
          :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} rounded`"
          lang="yaml"
          :options="Object.assign($aceOptions, { readOnly: false, wrap: true })"
          theme="chrome"
          :style="`height: ${height}px !important`"
          @init="$aceinit"
          @keydown.stop
        />
      </div>
      <AppStoreDeployLoading :dialog="deployDialog" />
    </TabContent>
    <TabContent
      title="完成"
      icon="ti-check"
      :lazy="false"
      :class="`zoom-${Scale.toString().replaceAll(
        '.',
        '-',
      )} kubegems__wizard-tab-content mt-12`"
    >
      <AppStoreComplete
        v-if="completed"
        class="mt-12 pt-12"
        @showDeployStatus="showDeployStatus"
      />
    </TabContent>
    <template #footer="props">
      <v-flex
        class="kubegems__wizard-footer"
        :style="`right:${footerWidth}px;`"
      >
        <v-btn
          v-show="props.activeTabIndex > 0"
          text
          color="primary"
          @click.native="props.prevTab()"
        >
          上一步
        </v-btn>
        <v-btn
          v-if="props.activeTabIndex === 0"
          text
          color="primary"
          @click.native="nextStep(props)"
        >
          下一步
        </v-btn>

        <v-btn
          v-if="props.activeTabIndex === 1"
          text
          color="primary"
          :loading="Circular"
          @click.native="deployAppStore(props)"
        >
          部署
        </v-btn>
      </v-flex>
    </template>
  </FormWizard>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { postDeployAppStore } from '@/api'
import Tips from './Tips'
import AppStoreDeployLoading from './AppStoreDeployLoading'
import AppStoreComplete from './AppStoreComplete'
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'
import BasePermission from '@/mixins/permission'
import { YamlMixin } from '@/views/appstore/mixins/yaml'
import { k8sName, required } from '@/utils/rules'

import { FormWizard, TabContent } from 'vue-form-wizard'
import 'vue-form-wizard/dist/vue-form-wizard.min.css'

export default {
  name: 'DeployWizard',
  components: {
    FormWizard,
    TabContent,
    Tips,
    JsonSchema: () => import('./JsonSchema'),
    AppStoreDeployLoading,
    AppStoreComplete,
  },
  mixins: [BaseSelect, BaseResource, YamlMixin, BasePermission],
  props: {
    files: {
      type: Object,
      default: () => {},
    },
    currentApp: {
      type: Object,
      default: () => {},
    },
    versions: {
      type: Array,
      default: () => [],
    },
    selectRepo: {
      type: String,
      default: () => '',
    },
  },
  data: () => ({
    obj: {
      AppName: '',
      TenantProjectId: '',
      EnvironmentId: '',
      selectVersion: '',
      app: null,
    },
    valid: false,
    appValues: {},
    appValuesOrigin: {},
    appValuesYaml: null,
    schemaJson: {},
    yamlMode: false,
    params: [],
    currentStep: 1,
    timeout: null,
    deployDialog: false,
    completed: false,
    tab: 0,
    tabItems: [
      { text: '表单', value: 'DeployForm' },
      { text: 'Values', value: 'DeployFrom' },
    ],
  }),
  computed: {
    ...mapState([
      'Auth',
      'Circular',
      'AdminViewport',
      'Scale',
      'BasePermission',
    ]),
    ...mapGetters(['Tenant', 'Project', 'Environment']),
    objRules() {
      return {
        appNameRules: [
          required,
          k8sName,
        ],
        versionRules: [required],
        tenantProjectIdRules: [required],
        environmentIdRules: [required],
      }
    },
    clusterName() {
      const projectEnvironmentObj = this.projectEnvironmentSelect.find((e) => {
        return e.value === this.obj.EnvironmentId
      })
      return projectEnvironmentObj ? projectEnvironmentObj.clusterName : ''
    },
    footerWidth() {
      return (window.innerWidth / 12) * 9 + 10
    },
    height() {
      // 还原缩放系数zoom-0-9带来的像素差别
      return (window.innerHeight - 64 - 1 - 24 - 8 - 88) / this.Scale
    },
    showForm() {
      return (
        this.files['values.schema.json'] !== undefined &&
        this.files['values.schema.json'] !== null
      )
    },
  },
  destroyed() {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
  },
  methods: {
    validateBaseInfo() {
      const ret = this.$refs.baseInfoForm.validate(true)
      this.currentStep = ret ? 2 : 1
      return ret
    },
    validateJsonSchema() {
      return this.$refs.jsonSchema.$refs.form.validate(true)
    },
    async parseFiles() {
      this.readme = this.files['README.md'] || {}
      if (this.files['values.schema.json']) {
        this.schemaJson = JSON.parse(this.files['values.schema.json'])
      }
      if (this.files['values.yaml']) {
        this.appValues = this.$yamlload(this.files['values.yaml'])
        this.appValuesOrigin = this.$yamlload(this.files['values.yaml'])
        this.appValuesYaml = this.$yamldump(this.appValuesOrigin)
      }
      if (Object.keys(this.appValues).length === 0) {
        this.$store.commit('SET_SNACKBAR', {
          text: '获取values.yaml失败',
          color: 'warning',
        })
        return
      }
      // 获取所有需要渲染的参数列表
      this.params = this.retrieveBasicFormParams(
        this.appValues,
        this.schemaJson,
      )
    },
    retrieveBasicFormParams(defaultValues, schema, parentPath = '') {
      let params = []
      if (schema && schema.properties) {
        const properties = schema.properties
        Object.keys(properties).forEach((propertyKey) => {
          const itemPath = `${parentPath || ''}${propertyKey}`
          const { type, form } = properties[propertyKey]
          if (form) {
            // Use the default value either from the JSON schema or the default values
            // 使用schema中的默认值
            // const value = properties[propertyKey].default
            // 使用values.yaml的默认值
            const value = this.getValueSchema(
              defaultValues,
              itemPath,
              properties[propertyKey].default,
            )
            const param = {
              ...properties[propertyKey],
              path: itemPath,
              name: propertyKey,
              type,
              value,
              enum: properties[propertyKey].enum?.map(
                (item) => item?.toString() ?? '',
              ),
              children:
                properties[propertyKey].type === 'object'
                  ? this.retrieveBasicFormParams(
                      defaultValues,
                      properties[propertyKey],
                      `${itemPath}/`,
                    )
                  : undefined,
            }
            params = params.concat(param)
          } else {
            // form为假不渲染
            // If the property is an object, iterate recursively 递归遍历
            if (schema.properties[propertyKey].type !== 'object') {
              params = params.concat(
                this.retrieveBasicFormParams(
                  defaultValues,
                  properties[propertyKey],
                  `${itemPath}/`,
                ),
              )
            }
          }
        })
      }
      return params
    },
    changeBasicFormParam(param, value) {
      // Change raw values 修改原始值, 返回的是字符串
      this.appValues = this.setValue(this.appValues, param.path, value)
      this.reRender()
    },
    reRender() {
      this.params = []
      this.params = this.retrieveBasicFormParams(
        this.appValues,
        this.schemaJson,
      )
    },
    async deployAppStore() {
      if (this.yamlMode || !this.showForm) {
        this.appValues = this.$yamlload(this.appValuesYaml)
        this.runDeploy()
      } else {
        if (this.validateJsonSchema()) {
          // 解除验证错误
          this.$refs.deploy.setValidationError(null)
          this.runDeploy()
          // 提前加载项目环境
        } else {
          // 手动触发校验失败,标题显示红色样式
          this.$refs.deploy.setValidationError(new Error('参数校验失败'))
        }
      }
    },
    async runDeploy() {
      const jsonData = {
        name: this.obj.AppName,
        project_id: this.obj.TenantProjectId,
        environment_id: this.obj.EnvironmentId,
        repoURL: this.currentApp.repoURL,
        chart: this.obj.app,
        chartVersion: this.obj.selectVersion,
        tenant_id: this.Tenant().ID,
        values: this.appValues,
      }
      this.deployDialog = true
      this.timeout = setTimeout(() => {
        this.deployDialog = false
        clearTimeout(this.timeout)
      }, 3000)
      await postDeployAppStore(
        this.Tenant().ID,
        this.obj.TenantProjectId,
        this.obj.EnvironmentId,
        jsonData,
      )
      this.$refs.deploy.nextTab()
      this.deployDialog = false
      if (this.timeout) clearTimeout(this.timeout)
      this.completed = true
    },
    async onEnvSelectFocus() {
      await this.projectEnvironmentSelectData(this.obj.TenantProjectId)
      // 系统管理员->租户管理员->项目管理员(auth中有项目ID)->其他,断路判断是否启用环境过滤
      this.projectEnvironmentSelect = this.projectEnvironmentSelect.filter(
        (projectEnv) => {
          return (
            this.tenantAllow ||
            this.Auth.projects.some((p) => {
              return p.isAdmin && p.id === this.obj.TenantProjectId
            }) ||
            this.Auth.environments.some((authEnv) => {
              return authEnv.isAdmin && authEnv.name === projectEnv.text
            })
          )
        },
      )
    },
    async showDeployStatus() {
      const project = this.tenantProjectSelect.find((p) => {
        return p.value === this.obj.TenantProjectId
      })
      if (!project) {
        this.$store.commit('SET_SNACKBAR', {
          text: '项目为空',
          color: 'warning',
        })
        return
      }
      const environment = this.projectEnvironmentSelect.find((e) => {
        return e.value === this.obj.EnvironmentId
      })

      if (!environment) {
        this.$store.commit('SET_SNACKBAR', {
          text: '环境为空',
          color: 'warning',
        })
        return
      }
      this.$router.push({
        name: 'app-detail',
        params: {
          name: this.obj.AppName,
          tenant: this.Tenant().TenantName,
          project: project.text,
          environment: environment.environmentName,
        },
        query: {
          projectid: this.obj.TenantProjectId,
          tenantid: this.Tenant().ID,
          kind: 'appstore',
          namespace: environment.Namespace,
        },
      })
    },
    onAppNameChange() {
      if (
        Object.prototype.hasOwnProperty.call(this.appValues, 'nameOverride')
      ) {
        this.appValues.nameOverride = this.obj.AppName
      }
      if (
        Object.prototype.hasOwnProperty.call(this.appValues, 'fullnameOverride')
      ) {
        this.appValues.fullnameOverride = this.obj.AppName
      }
      this.appValuesYaml = this.setYamlValue(
        this.appValuesYaml,
        'nameOverride',
        this.obj.AppName,
      )
      this.appValuesYaml = this.setYamlValue(
        this.appValuesYaml,
        'fullnameOverride',
        this.obj.AppName,
      )

      // 数据驱动组件重新渲染
      this.params = []
      this.params = this.retrieveBasicFormParams(
        this.appValues,
        this.schemaJson,
      )
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      if (this.$refs.baseInfoForm) {
        this.$refs.baseInfoForm.reset()
      }
      if (this.$refs.jsonSchema && this.$refs.jsonSchema.$refs.form) {
        this.$refs.jsonSchema.$refs.form.reset()
      }
    },
    async nextStep(props) {
      this.tab = 1
      await props.nextTab()
      // 手动切换tab
      if (this.showForm) {
        this.tab = 0
      }
    },
    onAppVersionChange() {
      if (this.obj.selectVersion) {
        this.$emit('onAppVersionChange', this.obj.selectVersion)
        this.parseFiles()
        this.onAppNameChange()
      }
    },
    onTabChange() {
      if (this.tab === 0) {
        this.yamlMode = false
        this.reRender()
      } else {
        this.yamlMode = true
      }
    },
    onTenantProjectSelectFocus() {
      this.tenantProjectSelectData()
    },
  },
}
</script>

<style lang="scss">
/* 覆盖样式 */
.vue-form-wizard .wizard-tab-content {
  padding: 0 0 0;
}
.vue-form-wizard .wizard-card-footer {
  padding: 0 0;
}
.wizard-form-content {
  margin-bottom: 0;
  padding: 0;
}
.vue-form-wizard .wizard-header {
  padding: 0;
}
.vue-form-wizard {
  padding-bottom: 0;
}

/* 自定义样式 */
.wizard-footer-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
