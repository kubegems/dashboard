<!-- 展示Label的下拉输入组件 -->

<template>
  <v-menu
    v-model="showMenu"
    bottom
    left
    offset-y
    origin="top center"
    transition="scale-transition"
    nudge-bottom="5px"
    :close-on-content-click="false"
  >
    <template #activator="{ on }">
      <v-btn
        depressed
        color="white"
        class="primary--text"
        :class="buttonClass"
        small
        dark
        v-on="on"
      >
        <span
          v-if="label"
          class="mr-2"
        >{{ label }}</span>
        <span>{{ value2format }}</span>
        <v-icon
          v-if="showMenu"
          right
        >
          fas fa-angle-up
        </v-icon>
        <v-icon
          v-else
          right
        >
          fas fa-angle-down
        </v-icon>
      </v-btn>
    </template>
    <v-card class="pa-2">
      <slot />
    </v-card>
  </v-menu>
</template>

<script>
export default {
  name: 'LabelInput',
  props: {
    value: {
      type: [String, Number],
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    emptyValuePlaceholder: {
      type: String,
      default: '',
    },
    buttonClass: {
      type: String,
      default: undefined,
    },
  },
  data() {
    return {
      showMenu: false,
    }
  },
  computed: {
    value2format() {
      return typeof this.value === 'number'
        ? this.value
        : this.value || this.emptyValuePlaceholder
    },
  },
}
</script>
