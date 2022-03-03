export default {
  install(Vue) {
    Vue.prototype.$pluginPass = (dependencies) => {
      let pass = true
      if (dependencies === undefined) return pass
      dependencies.forEach(d => {
        if (!this.Plugins[d]) {
          pass = false
          return
        }
      })
      return pass
    }
  },
}
