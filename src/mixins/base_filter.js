const basefilter = {
  inject: ['reload'],
  methods: {
    async filterList(params, reload = true) {
      Object.assign(this.params, params)
      await this.$router.replace({ name: this.$route.name, query: params })
      if (reload) {
        this.reload()
      }
    },
  },
}

export default basefilter
