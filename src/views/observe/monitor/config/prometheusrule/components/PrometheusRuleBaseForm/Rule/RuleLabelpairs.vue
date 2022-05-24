<template>
  <v-row class="px-2">
    <v-col
      v-for="item in labels"
      :key="item.label"
      class="py-0"
      cols="4"
    >
      <v-text-field
        :value="item.value"
        :label="item.label"
        hint="多值以 | 分割"
        class="my-0"
        @change="onChange($event, item.label)"
      />
    </v-col>
  </v-row>
</template>

<script>
  export default {
    name: 'RuleLabelpairs',
    props: {
      value: {
        type: Object,
        default: () => {},
      },
    },
    data () {
      return {
        labels: [],
      }
    },
    watch: {
      value: {
        handler () {
          this.initLabels()
        },
        immediate: true,
      },
    },
    methods: {
      initLabels () {
        this.labels = Object.keys(this.value || {}).map(label => ({
          label,
          value: this.value[label],
        }))
      },
      onChange (value, label) {
        this.$emit('input', { ...this.value, [label]: value })
      },
    },
  }
</script>
