<template>
  <v-form
    ref="form"
    class="py-4"
    lazy-validation
    @submit.prevent
  >
    <div class="text-subtitle-1 px-6 py-2">
      <abbr>trace sdk 请参考:</abbr>
      <a
        target="_blank"
        href="https://opentelemetry.io/docs/instrumentation/"
      >
        https://opentelemetry.io/docs/instrumentation/
      </a>
    </div>
  </v-form>
</template>

<script>
export default {
  name: 'Trace',
  mounted() {
    this.$nextTick(() => {
      this.$refs.form.resetValidation()
    })
  },
  methods: {
     // eslint-disable-next-line vue/no-unused-properties
    async addData() {
      //
    },
  },
}
</script>

