<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
    class="my-2"
  >
    <v-expand-transition>
      <v-card
        v-show="expand"
        class="my-2 pa-2 kubegems__expand-transition"
        :elevation="4"
      >
        <v-card-text class="pa-0">
          <v-sheet class="pt-2 px-2">
            <v-flex
              class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width"
            >
              <span>环境定义</span>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-autocomplete
                v-model="obj.projectid"
                :rules="objRules.projectIDRules"
                :items="projectSelect"
                color="primary"
                label="租户(项目)"
                hide-selected
                class="my-0"
                no-data-text="暂无可选数据"
                @focus="onProjectSelectFocus"
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
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__form-width">
              <v-autocomplete
                v-model="obj.environmentid"
                :rules="objRules.environmentIDRules"
                :items="projectEnvironmentSelect"
                color="primary"
                label="环境"
                hide-selected
                class="my-0"
                no-data-text="暂无可选数据"
                @focus="onProjectEnvironmentSelectFocus(obj.projectid, true)"
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
import BaseSelect from '@/mixins/select'
import { deepCopy } from '@/utils/helpers'
import { required } from '@/utils/rules'

export default {
  name: 'LinkEnvironmentForm',
  mixins: [BaseSelect],
  props: {
    data: {
      type: Array,
      default: () => null,
    },
  },
  data() {
    return {
      valid: false,
      expand: false,
      obj: {
        index: -1,
        projectid: null,
        environmentid: null,
      },
      objRules: {
        projectIDRules: [required],
        environmentIDRules: [required],
      },
    }
  },
  computed: {
    env() {
      const env = this.projectEnvironmentSelect.find((e) => {
        return e.value === this.obj.environmentid
      })
      if (env) return env
      return {}
    },
  },
  watch: {
    data() {
      this.portsCopy = deepCopy(this.data)
    },
  },
  mounted() {
    if (this.data) {
      this.portsCopy = deepCopy(this.data)
    }
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    init(data) {
      this.obj = data
      this.projectSelectData()
      this.projectEnvironmentSelectData(this.obj.projectid, true)
      this.expand = true
    },
    addData() {
      if (this.$refs.form.validate(true)) {
        this.$emit(
          'addData',
          Object.assign(this.env, { index: this.obj.index }),
        )
        this.closeCard()
      }
    },
    closeCard() {
      this.expand = false
      this.$refs.form.reset()
      this.obj = {
        index: -1,
        projectid: null,
        environmentid: null,
      }
      this.$emit('closeOverlay')
    },
    // eslint-disable-next-line vue/no-unused-properties
    expandCard() {
      this.expand = true
    },
    onProjectSelectFocus() {
      this.projectSelectData()
    },
    onProjectEnvironmentSelectFocus(projectid, vs = true) {
      this.projectEnvironmentSelectData(projectid, vs)
    },
  },
}
</script>
