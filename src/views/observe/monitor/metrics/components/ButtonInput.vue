<!-- 展示Label的下拉输入组件 -->

<template>
  <v-menu
    v-model="showMenu"
    bottom
    :close-on-content-click="false"
    left
    nudge-bottom="5px"
    offset-y
    origin="top center"
    transition="scale-transition"
  >
    <template #activator="{ on }">
      <v-btn class="primary--text" :class="buttonClass" color="white" dark depressed small v-on="on">
        <span v-if="label" class="mr-2">{{ label }}</span>
        <span>{{ value2format }}</span>
        <v-icon v-if="showMenu" right> fas fa-angle-up </v-icon>
        <v-icon v-else right> fas fa-angle-down </v-icon>
      </v-btn>
    </template>
    <v-card class="pa-2" flat>
      <slot />
    </v-card>
  </v-menu>
</template>

<script>
  export default {
    name: 'LabelInput',
    props: {
      buttonClass: {
        type: String,
        default: undefined,
      },
      emptyValuePlaceholder: {
        type: String,
        default: '',
      },
      label: {
        type: String,
        default: '',
      },
      value: {
        type: [String, Number],
        default: '',
      },
    },
    data() {
      return {
        showMenu: false,
      };
    },
    computed: {
      value2format() {
        return typeof this.value === 'number' ? this.value : this.value || this.emptyValuePlaceholder;
      },
    },
  };
</script>
