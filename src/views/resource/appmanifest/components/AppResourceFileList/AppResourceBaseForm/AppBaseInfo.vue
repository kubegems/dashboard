<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
    @submit.prevent
  >
    <BaseSubTitle title="资源类型" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="6">
          <v-autocomplete
            v-model="resourceKind"
            color="primary"
            :items="kinds"
            :rules="objRules.kindRule"
            label="资源"
            hide-selected
            class="my-0"
            no-data-text="暂无可选数据"
            @change="onKindChange"
          >
            <template #selection="{ item }">
              <v-chip
                color="primary"
                small
                class="mx-1"
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
import { mapGetters, mapState } from 'vuex'
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'
import { required } from '@/utils/rules'

export default {
  name: 'AppBaseInfo',
  mixins: [BaseSelect, BaseResource],
  props: {
    kinds: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    valid: false,
    resourceKind: '',
    obj: {},
    objRules: {
      kindRule: [required],
    },
  }),
  computed: {
    ...mapState(['AdminViewport']),
    ...mapGetters(['Project']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs.form.reset()
    },
    // eslint-disable-next-line vue/no-unused-properties
    init(data) {
      this.$nextTick(() => {
        this.obj = this.$_.merge(this.obj, deepCopy(data))
      })
    },
    // eslint-disable-next-line vue/no-unused-properties
    back(data) {
      this.$nextTick(() => {
        this.obj = deepCopy(data)
      })
    },
    onKindChange() {
      this.$emit('change', this.resourceKind)
    },
    // eslint-disable-next-line vue/no-unused-properties
    validate() {
      return this.$refs.form.validate(true)
    },
    // eslint-disable-next-line vue/no-unused-properties
    checkSaved() {
      if (Object.prototype.hasOwnProperty.call(this, 'expand')) {
        return !this.expand
      }
      return true
    },
    // eslint-disable-next-line vue/no-unused-properties
    getData() {
      return this.obj
    },
  },
}
</script>
