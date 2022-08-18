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
  <div class="d-inline-block">
    <span>{{ $t('tip.severity') }}:</span>
    <v-menu v-for="item in legends" :key="item.value" :close-delay="200" nudge-top="23px" open-on-hover top>
      <template #activator="{ on }">
        <v-btn
          class="ml-3 log-level-select__btn"
          :class="{ 'white--text': checked.includes(item.value) }"
          :color="item.color"
          light
          :outlined="!checked.includes(item.value)"
          x-small
          v-on="on"
          @click="handleClick(item.value)"
        >
          {{ item.text }}
        </v-btn>
      </template>
      <v-card>
        <v-card-text class="pa-2"> {{ item.intro }} </v-card-text>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
  import messages from '../../i18n';

  export default {
    name: 'LogLevelSelect',
    i18n: {
      messages: messages,
    },
    props: {
      value: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      this.legends = [
        {
          text: 'Info',
          value: 'info',
          color: 'success',
          intro: this.$t('tip.info_regex'),
        },
        {
          text: 'Debug',
          value: 'debug',
          color: 'primary',
          intro: this.$t('tip.debug_regex'),
        },
        {
          text: 'Warn',
          value: 'warn',
          color: 'warning',
          intro: this.$t('tip.warn_regex'),
        },
        {
          text: 'Error',
          value: 'error',
          color: 'error',
          intro: this.$t('tip.error_regex'),
        },
        {
          text: 'Unknown',
          value: 'unknown',
          color: 'blue-grey',
          intro: this.$t('tip.unknown_regex'),
        },
      ];

      return {
        checked: this.value,
      };
    },
    watch: {
      value() {
        this.checked = [...this.value];
      },
    },
    methods: {
      handleClick(value) {
        if (this.checked.includes(value)) {
          this.checked = this.checked.filter((l) => l !== value);
        } else {
          this.checked.push(value);
        }
        this.$emit('input', [...this.checked]);
        this.$emit('change', [...this.checked]);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .log-level-select__btn {
    position: relative;
    top: -2px;
  }
</style>
