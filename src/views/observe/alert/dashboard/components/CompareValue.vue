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
  <div :class="classNames">
    <span class="compare-value__name">{{ name }}</span>
    <span v-if="diff !== 0" class="compare-value__value">
      {{ value }}
    </span>
    <v-icon v-if="diff !== 0" class="compare-value__icon mt-n1">
      {{ icon }}
    </v-icon>
    <span v-else>{{ $t('tip.not_changed') }}</span>
  </div>
</template>

<script>
  import messages from '../../i18n';
  import { toFixed } from '@/utils/helpers';

  export default {
    name: 'CompareValue',
    i18n: {
      messages: messages,
    },
    props: {
      name: {
        type: String,
        default: '',
      },
      // 颜色反转
      reverse: {
        type: Boolean,
        default: false,
      },
      type: {
        type: String,
        default: 'percentage',
        validator: (v) => ['number', 'percentage'].includes(v),
      },
      value1: {
        type: Number,
        default: 0,
      },
      value2: {
        type: Number,
        default: 0,
      },
    },
    data() {
      return {};
    },
    computed: {
      diff() {
        let diff = this.value1 - this.value2;
        if (this.type === 'percentage') {
          diff = this.value1 !== 0 ? toFixed((diff / this.value1) * 100) : 0;
        }
        return diff;
      },
      value() {
        return `${Math.abs(this.diff)}${this.type === 'percentage' ? '%' : ''}`;
      },
      classNames() {
        return {
          'compare-value': true,
          'compare-value--reduce': this.reverse ? this.diff > 0 : this.diff < 0,
          'compare-value--increase': this.reverse ? this.diff < 0 : this.diff > 0,
          'compare-value--nochange': this.diff === 0,
        };
      },
      icon() {
        switch (true) {
          case this.diff > 0:
            return 'mdi-arrow-down';
          case this.diff < 0:
            return 'mdi-arrow-up';
          default:
            return 'mdi-arrow-down';
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .compare-value {
    display: inline-block;
    font-size: 1rem;

    &__name {
      color: $primary;
    }

    &__icon {
      margin: 0 2px;
    }

    &--increase {
      .compare-value__icon {
        color: #009688;
      }
    }

    &--reduce {
      .compare-value__icon {
        color: $accent;
      }
    }

    &--nochange {
      .compare-value__icon {
        color: $primary;
      }
    }
  }
</style>
