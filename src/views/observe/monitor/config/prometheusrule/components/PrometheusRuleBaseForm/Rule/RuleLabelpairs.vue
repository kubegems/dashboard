<template>
  <v-row class="px-2">
    <v-col v-for="item in labels" :key="item.label" class="py-0" cols="4">
      <v-text-field
        class="my-0"
        hint="多值以 | 分割"
        :label="item.label"
        :value="item.value"
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
    data() {
      return {
        labels: [],
      };
    },
    watch: {
      value: {
        handler() {
          this.initLabels();
        },
        immediate: true,
      },
    },
    methods: {
      initLabels() {
        this.labels = Object.keys(this.value || {}).map((label) => ({
          label,
          value: this.value[label],
        }));
      },
      onChange(value, label) {
        this.$emit('input', { ...this.value, [label]: value });
      },
    },
  };
</script>
