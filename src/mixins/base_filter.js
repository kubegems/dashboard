const basefilter = {
  inject: ['reload'],
  methods: {
    async m_filter_list(params, reload = true) {
      Object.assign(this.params, params)
      await this.$router.replace({ name: this.$route.name, query: params })
      if (reload) {
        this.reload()
      }
    },
  },
}

export default basefilter
