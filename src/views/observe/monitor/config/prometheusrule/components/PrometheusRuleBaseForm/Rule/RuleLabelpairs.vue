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
  <v-row class="px-2">
    <v-col v-for="item in labels" :key="item.label" class="py-0" cols="4">
      <v-text-field
        class="my-0"
        :hint="$t('tip.split_by_vertical')"
        :label="item.label"
        :value="item.value"
        @change="onChange($event, item.label)"
      />
    </v-col>
  </v-row>
</template>

<script>
  import messages from '../../../../../i18n';

  export default {
    name: 'RuleLabelpairs',
    i18n: {
      messages: messages,
    },
    props: {
      value: {
        type: Object,
        default: () => {},
      },
    },
    data() {
      return {
        labels: [],
      };
    },
    watch: {
      value: {
        handler() {
          this.initLabels();
        },
        immediate: true,
      },
    },
    methods: {
      initLabels() {
        this.labels = Object.keys(this.value || {}).map((label) => ({
          label,
          value: this.value[label],
        }));
      },
      onChange(value, label) {
        this.$emit('input', { ...this.value, [label]: value });
      },
    },
  };
</script>
