const ConstructMixin = {
  methods: {
    // 获取默认数据
    ConstructFormData(properties) {
      const propsformdata = {};
      for (var item in properties) {
        // https://eslint.org/docs/rules/no-prototype-builtins
        if (Object.prototype.hasOwnProperty.call(properties[item], 'form') && properties[item].form) {
          if (properties[item].type === 'string') {
            propsformdata[item] = properties[item].default !== undefined ? properties[item].default : '';
          } else if (properties[item].type === 'integer') {
            propsformdata[item] = properties[item].default !== undefined ? properties[item].default : 1;
          } else if (properties[item].type === 'boolean') {
            propsformdata[item] = properties[item].default !== undefined ? properties[item].default : false;
          } else if (properties[item].type === 'object') {
            propsformdata[item] = this.ConstructFormData(properties[item].properties);
          }
        }
        // else { // 没有form字段或form为假
        //   propsformdata[item] = {}
        //   propsformdata[item] = this.ConstructFormData(
        //       properties[item].properties
        //   )
        // }
      }
      return propsformdata;
    },
    ConstructPropertyRules(properties) {
      const propsformdata = Object.assign({}, properties); // 深拷贝
      // const propsformdata = properties
      for (var item in properties) {
        // https://eslint.org/docs/rules/no-prototype-builtins
        if (Object.prototype.hasOwnProperty.call(properties[item], 'form') && properties[item].form) {
          if (properties[item].type === 'string') {
            if (properties[item].render && properties[item].render === 'slider') {
              const min = properties[item].sliderMin ? properties[item].sliderMin : 1;
              const max = properties[item].sliderMax ? properties[item].sliderMax : 100;
              propsformdata[item].rules = [(v) => v >= min || '小于最小值', (v) => v <= max || '大于最大值'];
            } else {
              const note = propsformdata[item].title + '必填项';
              propsformdata[item].rules = [(v) => !!v || note];
            }
          } else if (properties[item].type === 'integer') {
            const min = properties[item].sliderMin ? properties[item].sliderMin : 1;
            const max = properties[item].sliderMax ? properties[item].sliderMax : 100;
            propsformdata[item].rules = [(v) => v >= min || '小于最小值', (v) => v <= max || '大于最大值'];
          } else if (properties[item].type === 'object') {
            propsformdata[item]['properties'] = this.ConstructPropertyRules(propsformdata[item].properties);
          }
        } else {
          // 如果未开启表单, 则删除该object
          delete propsformdata[item];
        }
      }
      return propsformdata;
    },
  },
};

export { ConstructMixin };
