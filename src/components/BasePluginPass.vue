<template>
  <div class="pass">
    <template v-if="!pluginPass($route.meta.dependencies)">
      <div class="container container--fluid">
        <BaseBreadcrumb  />
      </div>
      <v-card
        class="mx-3"
        height="400px"
      >
        <v-row class="pass__row">
          <v-col class="d-flex align-center justify-center">
            <div class="d-flex align-center pa-10">
              <div class="text-center">
                <h2 class="text-h5 primary--text font-weight-medium">
                  您暂时还未启用 {{ $route.meta.dependencies.join(', ') }} 插件！
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
          </v-col>
        </v-row>
      </v-card>
    </template>
    <slot v-else />
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'BasePluginPass',
  computed: {
    ...mapState(['Plugins']),
    breadcrumb() {
      return {
        title: this.$route.meta.title,
        tip: this.$TIP[this.$route.meta.tip],
        icon: this.$route.meta.icon,
      }
    },
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
.pass {
  position: relative;

  &__row {
    height: 400px;
  }
}
</style>
