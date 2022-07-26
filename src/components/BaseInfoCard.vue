<template>
  <v-card :flat="flat">
    <v-card-text class="pa-5">
      <div class="d-flex align-center">
        <v-btn class="elevation-0" color="primary" dark fab small>
          <v-icon>{{ icon }}</v-icon>
        </v-btn>
        <div class="ml-2 mr-1">
          <h2 :class="{ 'text-subtitle-1': !large, 'text-h6': large, 'font-weight-medium': !large }">
            {{ num }} {{ unit }}
          </h2>
          <h4 class="font-weight-regular mt-1"> {{ title }} </h4>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
  export default {
    name: 'BaseInfoCard',
    props: {
      flat: {
        type: Boolean,
        default: () => false,
      },
      icon: {
        type: String,
        default: () => '',
      },
      large: {
        type: Boolean,
        default: () => true,
      },
      num: {
        type: [Number, String],
        default: () => 0,
      },
      title: {
        type: String,
        default: () => '',
      },
      unit: {
        type: String,
        default: () => '',
      },
    },
  };
</script>
