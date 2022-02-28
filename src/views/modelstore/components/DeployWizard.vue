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
      title="部署信息"
      icon="ti-info-alt"
    >
      <v-form
        ref="baseInfoForm"
        v-model="valid"
        lazy-validation
        class="wizard-form-content"
      >
        <v-row>
          <v-col class="my-2">
            <v-autocomplete
              v-model="obj.ProjectId"
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
            <v-autocomplete
              v-model="obj.AppId"
              :items="appSelect"
              :rules="objRules.appIdRules"
              color="primary"
              label="应用"
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
              @focus="
                onAppSelectFocus(Tenant().ID, obj.ProjectId, obj.EnvironmentId)
              "
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
            <v-autocomplete
              color="primary"
              label="挂载路径"
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
              @focus="onEnvironmentSelectFocus"
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
            <v-autocomplete
              v-model="obj.Version"
              :menu-props="{
                bottom: true,
                left: true,
                origin: `top center`,
                transition: `scale-transition`,
              }"
              :items="versions"
              color="primary"
              :rules="objRules.versionRules"
              label="模型版本"
              hide-selected
              class="my-4"
              no-data-text="暂无可选数据"
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
          </v-col>
        </v-row>
      </v-form>
    </TabContent>
    <TabContent
      title="完成"
      icon="ti-check"
      :lazy="false"
      :class="`zoom-${Scale.toString().replaceAll(
        '.',
        '-',
      )} kubegems__wizard-tab-content mt-12`"
    />
    <template #footer="props">
      <v-flex
        class="kubegems__wizard-footer"
        :style="`right:${footerWidth}px;`"
      >
        <v-btn
          text
          color="primary"
          :loading="Circular"
          @click.native="deployModel(props)"
        >
          部署
        </v-btn>
      </v-flex>
    </template>
  </FormWizard>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { deployModel } from '@/api'
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'
import BasePermission from '@/mixins/permission'
import { required } from '@/utils/rules'

import 'vue-form-wizard/dist/vue-form-wizard.min.css'
import { FormWizard, TabContent } from 'vue-form-wizard'

export default {
  name: 'DeployWizard',
  components: {
    FormWizard,
    TabContent,
  },
  mixins: [BaseSelect, BaseResource, BasePermission],
  props: {
    versions: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    obj: {
      AppId: '',
      ProjectId: '',
      EnvironmentId: '',
      Version: '',
    },
    valid: false,
    timeout: null,
    deployDialog: false,
    completed: false,
  }),
  computed: {
    ...mapState([
      'Auth',
      'Circular',
      'AdminViewport',
      'Scale',
      'BasePermission',
      'ProjectStore',
      'EnvironmentStore',
    ]),
    ...mapGetters(['Tenant', 'Project', 'Environment']),
    objRules() {
      return {
        versionRules: [required],
        tenantProjectIdRules: [required],
        environmentIdRules: [required],
        appIdRules: [required],
      }
    },
    footerWidth() {
      return (window.innerWidth / 12) * 9 + 10
    },
  },
  destroyed() {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
  },
  methods: {
    async deployModel() {
      if (this.$refs.baseInfoForm.validate(true)) {
        this.deployDialog = true
        this.timeout = setTimeout(() => {
          this.deployDialog = false
          clearTimeout(this.timeout)
        }, 3000)
        await deployModel(
          this.Tenant().ID,
          this.obj.TenantProjectId,
          this.obj.EnvironmentId,
          {},
        )
        this.$refs.deploy.nextTab()
        this.deployDialog = false
        if (this.timeout) clearTimeout(this.timeout)
        this.completed = true
      }
    },
    async onEnvironmentSelectFocus() {
      await this.projectEnvironmentSelectData(this.obj.ProjectId)
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
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      if (this.$refs.baseInfoForm) {
        this.$refs.baseInfoForm.reset()
      }
    },
    onTenantProjectSelectFocus() {
      this.tenantProjectSelectData()
    },
    onAppSelectFocus(tenantid, projectid, environmentid) {
      this.appSelectData(tenantid, projectid, environmentid)
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
