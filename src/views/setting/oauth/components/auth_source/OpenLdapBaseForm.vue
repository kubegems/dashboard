<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
  >
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="6">
          <v-text-field
            class="my-0"
            required
            label="Ldap地址"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            class="my-0"
            required
            label="Ldap端口"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            class="my-0"
            required
            label="Secret"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            class="my-0"
            required
            label="search_dn"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            class="my-0"
            required
            label="search_password"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            class="my-0"
            required
            label="base_dn"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            class="my-0"
            required
            label="search_filter"
          />
        </v-col>
        <v-col cols="6">
          <v-switch
            hide-details
            class="mt-4"
            label="启用TLS"
          />
        </v-col>
        <v-col cols="12">
          <v-textarea
            class="my-0"
            auto-grow
            required
            label="CA证书"
          />
        </v-col>
        <v-col cols="6">
          <v-switch
            hide-details
            class="mt-4"
            label="跳过证书验证"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script>
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'BaseForm',
  props: {
    item: {
      type: Object,
      default: () => null,
    },
  },
  data: () => ({
    valid: false,
    obj: {

    },
  }),
  computed: {
  },
  watch: {
    item() {
      this.loadData(true)
    },
  },
  mounted() {
    this.loadData(false)
  },
  methods: {
    async loadData(cover = false) {
      this.$nextTick(() => {
        if (cover) {
          if (!this.item) {
            this.obj = this.$options.data().obj
            this.$refs.form.resetValidation()
          } else {
            this.obj = deepCopy(this.item)
          }
        }
      })
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs.form.reset()
    },
    // eslint-disable-next-line vue/no-unused-properties
    setData(data) {
      this.obj = data
    },
  },
}
</script>
