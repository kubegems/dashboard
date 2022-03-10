<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
    @submit.prevent
  >
    <BaseSubTitle title="虚拟空间定义" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model="obj.VirtualSpaceName"
            class="my-0"
            required
            label="空间名称"
            :rules="objRules.virtualSpaceNameRule"
            :readonly="edit"
          />
        </v-col>
        <!-- <v-col cols="2">
          <v-switch v-model="obj.dns" class="mt-4" label="启用DNS"></v-switch>
        </v-col> -->
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script>
import { mapState } from 'vuex'
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'
import { required } from '@/utils/rules'

export default {
  name: 'VirtualSpaceBaseInfo',
  mixins: [BaseSelect, BaseResource],
  props: {
    item: {
      type: Object,
      default: () => null,
    },
    edit: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      valid: false,
      obj: {
        VirtualSpaceName: '',
        Environments: [],
        Users: [],
      },
    }
  },
  computed: {
    ...mapState(['AdminViewport']),
    objRules() {
      return {
        virtualSpaceNameRule: [required],
      }
    },
  },
  watch: {
    item() {
      this.loadData()
    },
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.$nextTick(() => {
        if (this.item) this.obj = deepCopy(this.item)
      })
    },
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
  },
}
</script>
