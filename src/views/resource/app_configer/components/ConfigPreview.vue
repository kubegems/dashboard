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
  <BasePanel v-model="panel" icon="mdi-code-json" :title="$t('tip.config')" :width="`50%`" @dispose="dispose">
    <template #header>
      <span class="ml-3">
        {{ title }}
      </span>
    </template>
    <template #action>
      <v-radio-group v-model="suffix" class="mt-1" hide-details row>
        <v-radio
          v-for="(t, index) in suffixItems"
          :key="index"
          active-class="active"
          class="kubegems__radio"
          color="white"
          :label="t.text"
          :value="t.value"
        />
      </v-radio-group>
    </template>
    <template #content>
      <v-card-text class="ma-0 pa-0">
        <ACEEditor
          v-model="content"
          :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} rounded-0`"
          :lang="suffix"
          :options="Object.assign($aceOptions, { readOnly: true, wrap: true })"
          :style="{ height: `${height}px !important` }"
          theme="chrome"
          @keydown.stop
        />
      </v-card-text>
    </template>
  </BasePanel>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../i18n';

  export default {
    name: 'ConfigPreview',
    i18n: {
      messages: messages,
    },
    data() {
      return {
        panel: false,
        content: '',
        title: '',
        suffix: '',
        suffixItems: [
          { text: 'text', value: 'text' },
          { text: 'json', value: 'json' },
          { text: 'xml', value: 'xml' },
          { text: 'yaml', value: 'yaml' },
          { text: 'html', value: 'html' },
          { text: 'ini', value: 'ini' },
          { text: 'properties', value: 'properties' },
        ],
      };
    },
    computed: {
      ...mapState(['Scale']),
      height() {
        return window.innerHeight - 64 * this.Scale - 1;
      },
    },
    methods: {
      open() {
        this.panel = true;
      },
      dispose() {
        return;
      },
      init(item) {
        this.content = item.value;
        this.title = item.key;
      },
    },
  };
</script>

<style lang="scss">
  .kubegems__radio label {
    color: white !important;
  }

  .kubegems__radio i {
    color: white !important;
  }
</style>

<style lang="scss" scoped>
  .active {
    color: white !important;
  }
</style>
