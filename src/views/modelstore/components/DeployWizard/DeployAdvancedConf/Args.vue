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
  <v-autocomplete
    v-model="args"
    hide-no-data
    hide-selected
    :items="argsItems"
    :label="$t('tip.params')"
    :menu-props="{
      bottom: true,
      left: true,
      origin: `top center`,
    }"
    multiple
    :search-input.sync="argsText"
    @keydown.enter="createArgs"
  >
    <template #selection="{ item }">
      <v-chip class="my-1" close close-icon="mdi-close-circle" color="primary" small @click:close="removeArgs(item)">
        <span class="mx-1">
          {{ item.text }}
        </span>
      </v-chip>
    </template>
  </v-autocomplete>
</template>

<script>
  import messages from '../../../i18n';

  export default {
    name: 'Args',
    i18n: {
      messages: messages,
    },
    data() {
      return {
        argsItems: [],
        argsText: '',
        args: [],
      };
    },
    watch: {
      value: {
        handler(newValue) {
          if (newValue) {
            this.args = newValue;
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      createArgs() {
        if (!this.argsText) return;
        this.args.push(this.argsText);
        this.argsItems.push({
          text: this.argsText,
          value: this.argsText,
        });
        this.argsText = '';
        this.$emit('input', this.args);
        this.$emit('change', this.args);
      },
      removeArgs(item) {
        const index = this.args.findIndex((args) => {
          return args !== item.value;
        });
        if (index > -1) {
          this.args.splice(index, 1);
          this.$emit('input', this.args);
          this.$emit('change', this.args);
        }
      },
    },
  };
</script>
