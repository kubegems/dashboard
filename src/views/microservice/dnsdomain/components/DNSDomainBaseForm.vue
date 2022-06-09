<template>
  <v-flex>
    <BaseSubTitle title="DNS定义" />
    <v-card-text class="pa-2">
      <v-form
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent
      >
        <v-sheet>
          <v-text-field
            v-model="obj.VirtualDomainName"
            class="my-0"
            required
            label="DNS"
            :rules="objRules.virtualDomainNameRules"
          />
        </v-sheet>
      </v-form>
    </v-card-text>
  </v-flex>
</template>

<script>
import { mapState } from 'vuex'
import BaseResource from '@/mixins/resource'
import { required } from '@/utils/rules'

export default {
  name: 'DNSDomainBaseForm',
  mixins: [BaseResource],
  data: () => ({
    valid: false,
    obj: {
      VirtualDomainName: '',
    },
  }),
  computed: {
    ...mapState(['Circular']),
    objRules() {
      return {
        virtualDomainNameRules: [required],
      }
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs.form.reset()
    },
    // eslint-disable-next-line vue/no-unused-properties
    validate() {
      return this.$refs.form.validate(true)
    },
    // eslint-disable-next-line vue/no-unused-properties
    getData() {
      return this.obj
    },
    // eslint-disable-next-line vue/no-unused-properties
    setData(data) {
      this.obj = data
    },
  },
}
</script>
