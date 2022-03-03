<template>
  <div :class="classNames">
    <span class="compare-value__name">{{ name }}</span>
    <span
      v-if="diff !== 0"
      class="compare-value__value"
    >
      {{ value }}
    </span>
    <v-icon
      v-if="diff !== 0"
      class="compare-value__icon"
    >
      {{ icon }}
    </v-icon>
    <span v-else>不变</span>
  </div>
</template>

<script>
import { toFixed } from '@/utils/helpers'

export default {
  name: 'CompareValue',
  props: {
    value1: {
      type: Number,
      default: 0,
    },
    value2: {
      type: Number,
      default: 0,
    },
    name: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'percentage',
      validator: v => ['number', 'percentage'].includes(v),
    },
    // 颜色反转
    reverse: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {

    }
  },
  computed: {
    diff () {
      let diff = this.value1 - this.value2
      if (this.type === 'percentage') {
        diff = this.value1 !== 0 ? toFixed(diff / this.value1 * 100) : 0
      }
      return diff
    },
    value () {
      return `${Math.abs(this.diff)}${this.type === 'percentage' ? '%' : ''}`
    },
    classNames () {
      return {
        'compare-value': true,
        'compare-value--increase': this.reverse ? this.diff > 0 : this.diff < 0,
        'compare-value--reduce': this.reverse ? this.diff < 0 : this.diff > 0,
        'compare-value--nochange': this.diff === 0,
      }
    },
    icon () {
      switch (true) {
        case this.diff > 0: return 'mdi-arrow-down'
        case this.diff < 0: return 'mdi-arrow-up'
        default: return 'mdi-arrow-down'
      }
    },
  },
}
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
