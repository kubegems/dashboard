const basefilter = {
  inject: ['reload'],
  methods: {
    async m_filter_list(params, reload = true) {
      // 处理多tab列表
      const tab = this.$route.query.tab || null;
      Object.assign(this.params, params);
      await this.$router.replace({
        params: this.$route.params,
        name: this.$route.name,
        query: Object.assign({ tab: tab, ...this.$route.query }, params),
      });
      if (reload) {
        this.reload();
      }
    },
  },
};

export default basefilter;
