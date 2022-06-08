<template>
  <v-app
    id="kubegems"
    :class="`${
      !$vuetify.breakpoint.smAndDown ? 'full-sidebar' : 'mini-sidebar'
    }`"
  >
    <router-view v-if="isReloadAlive" />
    <BaseProgress />
    <BaseSnackBar />
    <BaseConfirm />
  </v-app>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'App',
  provide() {
    return {
      reload: this.reload,
    }
  },
  data() {
    this.latestVersion = process.env.VUE_APP_RELEASE
    return {
      isReloadAlive: true,
    }
  },
  computed: {
    ...mapState(['SnackBar', 'Scale', 'Version']),
  },
  mounted() {
    // 初始化缩放
    this.initScale()
    // 版本迭代清理本地缓存
    this.clearLocalStorage()
  },
  methods: {
    reload() {
      this.isReloadAlive = false
      this.$nextTick(function () {
        this.isReloadAlive = true
      })
    },
    initScale() {
      let scale = 1.0
      if (this.$vuetify.breakpoint.name === 'lg') {
        if (window.innerWidth > 1440 && window.innerWidth < 1920) {
          scale = 0.9
        } else if (window.innerWidth > 1280 && window.innerWidth <= 1440) {
          scale = 0.85
        }
      } else if (this.$vuetify.breakpoint.name === 'xl') {
        scale = 0.95
      }
      document.getElementsByTagName('body')[0].style.zoom = scale
      this.$store.commit('SET_SCALE', scale)
    },
    async clearLocalStorage() {
      if (this.Version && this.Version !== this.latestVersion) {
        this.$store.commit('CLEARALL')
        await this.$router.push({ name: 'login' })
        this.$store.commit('SET_SNACKBAR', {
          text: `版本 ${this.latestVersion} 已发布，请重新登录`,
          color: 'warning',
        })
        this.$store.commit('SET_VERSION', this.latestVersion)
      }
    },
  },
}
</script>
