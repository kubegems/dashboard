<template>
  <v-card>
    <v-card-text class="pa-5">
      <div class="d-flex justify-space-between">
        <div class="d-flex">
          <v-icon class="primary--text mr-5" :style="{ fontSize: `40px` }">
            {{ icon }}
          </v-icon>
          <div>
            <h2 class="text-h5">{{ value }}</h2>
            <h5 class="text-subtitle-2 font-weight-regular">{{ name }}</h5>
          </div>
        </div>
        <div class="d-flex align-center justify-center">
          <CompareValue name="较昨日" :value1="compareValue" :value2="value" />
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
  import CompareValue from './CompareValue';

  export default {
    name: 'ValueCard',
    components: {
      CompareValue,
    },
    props: {
      compareValue: {
        type: Number,
        default: 0,
      },
      icon: {
        type: String,
        default: 'mdi-format-list-checkbox',
      },
      name: {
        type: String,
        default: '今日告警',
      },
      value: {
        type: Number,
        default: 0,
      },
    },
  };
</script>
