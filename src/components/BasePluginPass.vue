<template>
  <div>
    <v-card
      v-if="!pluginPass($route.meta.dependencies)"
      class="my-7 mx-4"
      height="400px"
    >
      <v-row class="row-height">
        <v-col class="d-none d-md-flex align-center justify-center">
          <div class="d-none d-sm-block">
            <div class="d-flex align-center pa-10">
              <div class="text-center">
                <h2 class="text-h5 primary--text font-weight-medium">
                  暂时未启用 {{ $route.meta.dependencies.join(',') }} 插件，请启用后查看
                </h2>
                <h6
                  class="
                    text-subtitle-1
                    mt-4
                    primary--text
                    op-5
                    font-weight-regular
                  "
                >
                  您可以联系平台管理员启用该插件
                </h6>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card>
    <slot v-else />
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'BasePluginPass',
  computed: {
    ...mapState(['Plugins']),
  },
  methods: {
    pluginPass(dependencies) {
      let pass = true
      if (dependencies === undefined) return pass
      dependencies.forEach(d => {
        if (!this.Plugins[d]) {
          pass = false
          return
        }
      })
      return pass
    },
  },
}
</script>

<style lang="scss" scoped>
.row-height {
  height: 400px;
}
</style>
