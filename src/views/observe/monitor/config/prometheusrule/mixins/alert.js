const alert = {
  methods: {
    severityMap(text) {
      const obj = { warning: '普通', error: '重要', critical: '紧急' };
      return obj[text];
    },
    compareMap(text) {
      const obj = {
        '>': '大于',
        '<': '小于',
        '<=': '小于或等于',
        '>=': '大于或等于',
        '=': '等于',
        '==': '等于',
        '!=': '不等于',
      };
      return obj[text];
    },
  },
};

export default alert;
