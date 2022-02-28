<template>
  <v-flex>
    <BaseSubTitle
      v-if="pathLevel === 1"
      :title="label"
      :color="pathLevel === 1 ? 'grey lighten-3' : ''"
      class="mb-4"
      :divider="false"
    />
    <v-text-field
      :id="id"
      :value="sliderVal"
      type="number"
      :label="pathLevel === 1 ? '' : label"
      :suffix="param.sliderUnit"
      :rules="rules"
      class="my-2"
      @change="onSliderChange($event)"
    />
    <v-flex />
  </v-flex>
</template>

<script>
import { required } from '@/utils/rules'

export default {
  name: 'MinMaxParam',
  props: {
    label: {
      type: String,
      default: () => '',
    },
    param: {
      type: Object,
      default: () => {},
    },
    id: {
      type: String,
      default: () => '',
    },
  },
  data: () => ({
    sliderVal: 0,
  }),
  computed: {
    pathLevel() {
      return this.param.path.split('/').length
    },
    rules() {
      return [
        required,
        (v) => v >= this.param.sliderMin || '小于最小值',
        (v) => v <= this.param.sliderMax || '大于最大值',
      ]
    },
  },

  mounted() {
    this.sliderVal = parseInt(this.param.value.match(/\d/g).join(''))
    this.onSliderChange(this.sliderVal)
  },
  methods: {
    change(event) {
      this.$emit('changeBasicFormParam', this.param, event)
    },
    onSliderChange(val) {
      const value = val + this.param.sliderUnit
      this.change(value)
    },
  },
}
</script>
