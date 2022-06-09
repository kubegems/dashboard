<template>
  <v-container fluid>
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-2 kubegems__text text-subtitle-1">Installer Operator设置</v-card-title>
      <v-form
        class="pa-4"
        lazy-validation
        @submit.prevent
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
                      <v-btn
                        class="mx-1"
                        depressed
                        small
                        color="primary"
                        @click="updateInstallerImage"
                      >
                        修改
                      </v-btn>
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
    installer: null,
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
  },
}
</script>
