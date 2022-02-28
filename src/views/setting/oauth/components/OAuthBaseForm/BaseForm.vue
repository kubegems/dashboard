<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
  >
    <BaseSubTitle title="OAuth定义" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="6">
          <v-autocomplete
            color="primary"
            label="JWT过期时间"
            hide-selected
            class="my-0"
            no-data-text="暂无可选数据"
          >
            <template #selection="{ item }">
              <v-chip
                color="primary"
                small
                class="ma-1"
              >
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
        <v-col cols="6">
          <v-text-field
            class="my-0"
            required
            label="Redirect URL"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            class="my-0"
            required
            label="Application ID"
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
          <v-autocomplete
            color="primary"
            label="Scope"
            hide-selected
            class="my-0"
            no-data-text="暂无可选数据"
          >
            <template #selection="{ item }">
              <v-chip
                color="primary"
                small
                class="ma-1"
              >
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
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
        this.tenantSelectData()
      })
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs.dataForm.closeCard()
      this.$refs.form.reset()
    },
    // eslint-disable-next-line vue/no-unused-properties
    setData(data) {
      this.obj = data
    },
  },
}
</script>
