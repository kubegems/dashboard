<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
-->

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
      type="number"
      :value="sliderVal"
      @change="onSliderChange($event)"
    >
      <template #append>
        <span class="text-body-2 kubegems__text">
          {{ param.sliderUnit }}
        </span>
      </template>
    </v-text-field>
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
