const metrics = {
  data() {
    return {
      m_metrics_unitText: '',
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
    m_metrics_units() {
      return {
        short: {
          cn: this.$t('tip.default'),
          value: ['n', 'u', 'm', '', 'K', 'Mil', 'Bil', 'Tri'],
        },
        bytes: {
          cn: this.$t('tip.byte'),
          value: ['B', 'KB', 'MB', 'GB', 'TB', 'PB'],
        },
        'bytes/sec': {
          cn: this.$t('tip.byte_rate'),
          value: ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s', 'PB/s'],
        },
        duration: {
          cn: this.$t('tip.time'),
          value: ['ns', 'us', 'ms', 's', 'm', 'h', 'd', 'w'],
        },
        percent: {
          cn: this.$t('tip.precent'),
          value: ['0.0-1.0', '0-100'],
        },
      };
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
          cn: this.$t('tip.custom'),
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
          cn: this.$t('tip.custom'),
          value: [this.m_metrics_unitText],
        });
      }
    },
  },
};

export default metrics;
