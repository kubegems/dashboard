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
      :rules="textRule"
      :type="inputType ? inputType : 'text'"
      :value="param.value"
      @change="onChange($event)"
    />
  </v-flex>
</template>

<script>
  import { required } from '@/utils/rules';

  export default {
    name: 'TextFieldParam',
    props: {
      id: {
        type: String,
        default: () => '',
      },
      inputType: {
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
    data() {
      return {
        textRule: [required],
      };
    },
    computed: {
      pathLevel() {
        return this.param.path.split('/').length;
      },
    },
    mounted() {
      this.onChange(this.param.value);
    },
    methods: {
      onChange(value) {
        if (this.inputType === 'number' && value) {
          value = parseFloat(value, 10);
        }
        if (value) {
          this.$emit('changeBasicFormParam', this.param, value);
        }
      },
    },
  };
</script>
