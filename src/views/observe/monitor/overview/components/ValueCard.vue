<template>
  <v-card>
    <v-card-text class="pa-5">
      <div class="d-flex justify-space-between">
        <div class="d-flex">
          <v-icon
            class="primary--text mr-5"
            style="font-size: 40px;"
          >
            {{ icon }}
          </v-icon>
          <div>
            <h2 class="text-h5">{{ value }}</h2>
            <h5 class="text-subtitle-2 font-weight-regular">{{ name }}</h5>
          </div>
        </div>
        <div class="d-flex align-center justify-center">
          <CompareValue
            :value1="value"
            :value2="compareValue"
            name="较昨日"
          />
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import CompareValue from './CompareValue.vue'

export default {
  name: 'ValueCard',
  components: {
    CompareValue,
  },
  props: {
    name: {
      type: String,
      default: '今日告警',
    },
    value: {
      type: Number,
      default: 0,
    },
    compareValue: {
      type: Number,
      default: 0,
    },
    icon: {
      type: String,
      default: 'mdi-format-list-checkbox',
    },
  },
}
</script>
