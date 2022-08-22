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
  <div>
    <v-autocomplete
      v-model="command"
      hide-no-data
      hide-selected
      :items="commandItems"
      :label="$t('tip.run_command')"
      :menu-props="{
        bottom: true,
        left: true,
        origin: `top center`,
      }"
      multiple
      :search-input.sync="commandText"
      @keydown.enter="createCommand"
    >
      <template #selection="{ item }">
        <v-chip
          class="my-1"
          close
          close-icon="mdi-close-circle"
          color="primary"
          small
          @click:close="removeCommand(item)"
        >
          <span class="mx-1">
            {{ item.text }}
          </span>
        </v-chip>
      </template>
    </v-autocomplete>
  </div>
</template>

<script>
  import messages from '../../../i18n';

  export default {
    name: 'Command',
    i18n: {
      messages: messages,
    },
    data() {
      return {
        commandItems: [],
        commandText: '',
        command: [],
      };
    },
    watch: {
      value: {
        handler(newValue) {
          if (newValue) {
            this.command = newValue;
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      createCommand() {
        if (!this.commandText) return;
        this.command.push(this.commandText);
        this.commandItems.push({
          text: this.commandText,
          value: this.commandText,
        });
        this.commandText = '';
        this.$emit('input', this.command);
        this.$emit('change', this.command);
      },
      removeCommand(item) {
        const index = this.command.findIndex((command) => {
          return command !== item.value;
        });
        if (index > -1) {
          this.command.splice(index, 1);
          this.$emit('input', this.command);
          this.$emit('change', this.command);
        }
      },
    },
  };
</script>
