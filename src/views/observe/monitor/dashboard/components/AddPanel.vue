<template>
  <div />
</template>

<script>
export default {
  name: 'AddPanel',
  props: {},
  data() {
    return {
      dialog: false,
    }
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
  },
}
</script>
