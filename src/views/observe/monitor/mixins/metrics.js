const metrics = {
  data() {
    return {
      m_metrics_unitText: '',
      m_metrics_units: {
        short: {
          cn: '默认',
          value: ['n', 'u', 'm', '', 'K', 'Mil', 'Bil', 'Tri'],
        },
        bytes: {
          cn: '字节',
          value: ['B', 'KB', 'MB', 'GB', 'TB', 'PB'],
        },
        'bytes/sec': {
          cn: '字节速率',
          value: ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s', 'PB/s'],
        },
        duration: {
          cn: '时间',
          value: ['ns', 'us', 'ms', 's', 'm', 'h', 'd', 'w'],
        },
        percent: {
          cn: '百分比',
          value: ['0.0-1.0', '0-100'],
        },
      },
    };
  },
  computed: {
    m_metrics_unitItems() {
      const items = [];
      Object.keys(this.m_metrics_units).forEach((unit) =>
        this.m_metrics_units[unit].value.forEach((u) => {
          if (unit === 'short') {
            items.push({
              text: `${this.m_metrics_units[unit].cn}`,
              value: `${unit}`,
            });
          } else {
            items.push({
              text: `${this.m_metrics_units[unit].cn}/${u}`,
              value: `${unit}-${u}`,
            });
          }
        }),
      );
      return items;
    },
  },
  methods: {
    m_metrics_initItems(unit) {
      if (
        !this.m_metrics_unitItems.some((u) => {
          return u.value === unit;
        })
      ) {
        this.$set(this.m_metrics_units, 'custom', {
          cn: '自定义',
          value: [unit],
        });
      }
    },
    m_metrics_createUnit() {
      if (!this.m_metrics_unitText) return;
      if (
        !this.m_metrics_unitItems.some((u) => {
          return u.value === this.m_metrics_unitText;
        })
      ) {
        this.$set(this.m_metrics_units, 'custom', {
          cn: '自定义',
          value: [this.m_metrics_unitText],
        });
      }
    },
  },
};

export default metrics;
