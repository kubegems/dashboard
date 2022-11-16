const basefilter: { [key: string]: any } = {
  inject: ['reload'],
  methods: {
    async m_filter_list(params: { [key: string]: any }, reload = true): Promise<void> {
      // 处理多tab列表
      const tab: string | null = this.$route.query.tab || null;
      Object.assign(this.params, params);
      await this.$router.replace({
        params: this.$route.params,
        name: this.$route.name,
        query: Object.assign({ tab: tab, ...this.$route.query, ...{ page: 1 } }, params),
      });
      if (reload) {
        this.reload();
      }
    },
  },
};

export default basefilter;
