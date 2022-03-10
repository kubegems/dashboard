<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
    class="my-2"
    @submit.prevent
  >
    <v-flex :class="expand ? 'kubegems__overlay' : ''" />
    <v-expand-transition>
      <v-card
        v-show="expand"
        class="my-2 pa-2 kubegems__expand-transition"
        :elevation="4"
      >
        <v-card-text class="pa-0">
          <v-sheet class="pt-2 px-2">
            <v-flex
              class="float-left text-subtitle-2 pt-6 primary--text kubegems__min-width"
            >
              <span>参数</span>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field
                v-model="obj.name"
                class="my-0"
                required
                label="name"
                :rules="objRules.nameRule"
              />
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-text-field
                v-model="obj.value"
                class="my-0"
                required
                label="value"
                :rules="objRules.valueRule"
              />
            </v-flex>
            <div class="kubegems__clear-float" />
          </v-sheet>
        </v-card-text>
        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn
            text
            small
            color="error"
            @click="closeCard"
          >
            取消
          </v-btn>
          <v-btn
            text
            small
            color="primary"
            @click="addData"
          >
            保存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>
  </v-form>
</template>

<script>
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'
import { required } from '@/utils/rules'

export default {
  name: 'ArgsForm',
  mixins: [BaseResource],
  props: {
    data: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      valid: false,
      expand: false,
      argsCopy: [],
      obj: {
        name: '',
        value: '',
      },
    }
  },
  computed: {
    objRules() {
      return {
        nameRule: [required],
        valueRule: [required],
      }
    },
  },
  watch: {
    data() {
      this.argsCopy = deepCopy(this.data)
    },
  },
  mounted() {
    if (this.data) {
      this.argsCopy = deepCopy(this.data)
    }
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    init(data) {
      this.obj = {
        name: data.name,
        value: data.value,
      }
      this.expand = true
    },
    addData() {
      if (this.$refs.form.validate(true)) {
        if (!this.argsCopy) this.argsCopy = []
        const index = this.argsCopy.findIndex((arg) => {
          return arg.name === this.obj.name && arg.value === this.obj.value
        })
        if (index > -1) {
          this.$set(this.argsCopy, index, this.obj)
        }
        this.argsCopy.push(deepCopy(this.obj))
        this.$emit('addData', this.argsCopy)
        this.closeCard()
      }
    },
    closeCard() {
      this.expand = false
      this.$refs.form.reset()
    },
    // eslint-disable-next-line vue/no-unused-properties
    expandCard() {
      this.expand = true
    },
  },
}
</script>
