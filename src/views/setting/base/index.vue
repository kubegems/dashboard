<template>
  <v-container fluid>
    <BaseBreadcrumb :breadcrumb="breadcrumb" />
    <v-card>
      <v-card-title class="py-2 kubegems__detail text-subtitle-1">Installer Operator设置</v-card-title>
      <v-form
        class="pa-4"
        lazy-validation
      >
        <v-sheet
          class="grey lighten-4 rounded"
        >
          <v-list-item two-line>
            <v-list-item-content class="py-1">
              <v-list-item-subtitle class="text-body-2 py-0">
                <v-list-item
                  two-line
                  class="float-left pa-0"
                >
                  <v-list-item-content class="py-0">
                    <v-list-item-title class="text-subtitle-2 py-1">
                      <v-icon
                        small
                      >
                        mdi-cube
                      </v-icon>
                      {{ installer ? installer.content.operator_image : '' }}
                      <v-chip
                        class="ml-1"
                        small
                        color="success"
                      >
                        运行中
                      </v-chip>
                      <v-flex class="float-right">
                        <v-btn
                          class="mx-1"
                          depressed
                          small
                          color="primary"
                          @click="updateInstallerImage"
                        >
                          修改
                        </v-btn>
                        <v-btn
                          class="mx-1"
                          depressed
                          small
                          color="error"
                        >
                          停止
                        </v-btn>
                      </v-flex>
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-body-2 py-1">
                      镜像
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-subtitle>
              <div class="kubegems__clear-float" />
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line>
            <v-list-item-content class="py-1">
              <v-list-item-subtitle class="text-body-2 py-0">
                <v-list-item
                  two-line
                  class="float-left pa-0"
                >
                  <v-list-item-content class="py-0">
                    <v-list-item-title class="text-subtitle-2 py-1">
                      <v-icon
                        small
                      >
                        mdi-file-document
                      </v-icon>
                      {{ installer ? installer.content.installer_yaml.metadata.name : '' }}
                      <v-btn
                        class="mx-1"
                        depressed
                        small
                        color="primary"
                        @click="updateInstaller"
                      >
                        修改
                      </v-btn>
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-body-2 py-1">
                      默认Install资源
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-subtitle>
              <div class="kubegems__clear-float" />
            </v-list-item-content>
          </v-list-item>
        </v-sheet>
      </v-form>
    </v-card>
    <v-card>
      <v-card-title class="py-2 kubegems__detail text-subtitle-1 mt-4">审计设置</v-card-title>
      <v-form
        class="pa-4"
        lazy-validation
      >
        <v-switch
          v-model="audit"
          hide-details
          label="启用"
          @change="operatorAudit"
        />
      </v-form>
    </v-card>

    <SetInstaller
      ref="setInstaller"
      @refresh="installerConfig"
    />
    <SetInstallImage
      ref="setInstallImage"
      @refresh="installerConfig"
    />
  </v-container>
</template>

<script>
import { getSystemConfigData } from '@/api'
import SetInstaller from './components/SetInstaller'
import SetInstallImage from './components/SetInstallerImage'

export default {
  name: 'BaseSetting',
  components: {
    SetInstaller,
    SetInstallImage,
  },
  data: () => ({
    breadcrumb: {
      title: '基本配置',
      tip: '平台基本配置, 包括平台审计, 平台组件等',
      icon: 'mdi-brightness-7',
    },
    installer: null,
    audit: true,
  }),
  mounted() {
    this.$nextTick(() => {
      this.installerConfig()
    })
  },
  methods: {
    async installerConfig() {
      const data = await getSystemConfigData('Installer')
      this.installer = data
    },
    updateInstaller() {
      this.$refs.setInstaller.init(this.installer)
      this.$refs.setInstaller.open()
    },
    updateInstallerImage() {
      this.$refs.setInstallImage.init(this.installer)
      this.$refs.setInstallImage.open()
    },
    operatorAudit() {
      this.$store.commit('SET_CONFIRM', {
        title: this.audit ? `启用审计` : `关闭审计`,
        content: {
          text: this.audit ? `启用审计` : `关闭审计`,
          type: 'confirm',
        },
        param: { },
        doFunc: async () => {

        },
        doClose: () => {
          this.audit = !this.audit
        },
      })
    },
  },
}
</script>
