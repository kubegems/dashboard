<template>
  <v-flex>
    <BaseSubTitle
      v-if="pathLevel === 1"
      class="mb-4"
      :color="pathLevel === 1 ? 'grey lighten-3' : ''"
      :divider="false"
      :title="label"
    />
    <v-text-field
      :id="id"
      class="my-2"
      :label="pathLevel === 1 ? '' : label"
      :rules="rules"
      :suffix="param.sliderUnit"
      type="number"
      :value="sliderVal"
      @change="onSliderChange($event)"
    />
    <v-flex />
  </v-flex>
</template>

<script>
  import { required } from '@/utils/rules';

  export default {
    name: 'MinMaxParam',
    props: {
      id: {
        type: String,
        default: () => '',
      },
      label: {
        type: String,
        default: () => '',
      },
      param: {
        type: Object,
        default: () => {},
      },
    },
    data: () => ({
      sliderVal: 0,
    }),
    computed: {
      pathLevel() {
        return this.param.path.split('/').length;
      },
      rules() {
        return [
          required,
          (v) => v >= this.param.sliderMin || '小于最小值',
          (v) => v <= this.param.sliderMax || '大于最大值',
        ];
      },
    },

    mounted() {
      this.sliderVal = parseInt(this.param.value.match(/\d/g).join(''));
      this.onSliderChange(this.sliderVal);
    },
    methods: {
      change(event) {
        this.$emit('changeBasicFormParam', this.param, event);
      },
      onSliderChange(val) {
        const value = val + this.param.sliderUnit;
        this.change(value);
      },
    },
  };
</script>
