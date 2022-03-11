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
        class="ma-2 pa-2 kubegems__expand-transition"
        :elevation="4"
      >
        <v-card-text class="pa-0">
          <v-sheet class="pt-2 px-2">
            <v-flex
              class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width"
            >
              <span>匹配规则</span>
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__three-form-width">
              <v-text-field
                v-model="obj.key"
                class="my-0"
                required
                label="key"
                :rules="objRules.keyRule"
              />
            </v-flex>
            <v-flex class="float-left ml-2 kubegems__three-form-width">
              <v-autocomplete
                v-model="obj.match"
                color="primary"
                :items="[
                  { text: 'exact', valeu: 'exact' },
                  { text: 'prefix', valeu: 'prefix' },
                  { text: 'regex', valeu: 'regex' },
                ]"
                label="match"
                hide-selected
                class="my-0"
                no-data-text="暂无可选数据"
                :rules="objRules.matchRule"
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
            <v-flex class="float-left ml-2 kubegems__three-form-width">
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
    <v-flex class="mx-2">
      <v-row v-if="JSON.stringify(labelsCopy) !== '{}'">
        <v-col
          v-for="(value, key) in labelsCopy"
          :key="key"
          class="pa-0"
        >
          <v-flex class="grey lighten-4 rounded-0 mt-3 mb-4 mx-3">
            <v-list-item>
              <v-list-item-content class="py-2">
                <v-list-item-subtitle class="text-body-2 py-0">
                  <v-list-item
                    two-line
                    class="float-left py-0 pl-0 kubegems__two-width"
                  >
                    <v-list-item-content class="py-0">
                      <v-list-item-title class="text-subtitle-2 py-1">
                        {{ key }}
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-body-2 py-1">
                        匹配头
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item
                    two-line
                    class="float-left py-0 pl-0 kubegems__two-width"
                  >
                    <v-list-item-content class="py-0">
                      <v-list-item-title class="text-subtitle-2 py-1">
                        {{ getValue(value) }}
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-body-2 py-1">
                        匹配规则
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-subtitle>
                <div class="kubegems__clear-float" />
              </v-list-item-content>
              <v-btn
                dark
                text
                fab
                right
                x-small
                color="primary"
                @click="updateLabels(key)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                dark
                text
                fab
                right
                x-small
                color="error"
                @click="removeLabels(key)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-list-item>
          </v-flex>
        </v-col>
      </v-row>
      <v-flex class="grey lighten-4 rounded-0 mt-2">
        <v-list-item two-line>
          <v-list-item-content class="py-2">
            <v-list-item-subtitle class="text-body-2 py-0 text-center">
              <v-btn
                text
                color="primary"
                @click="expandCard"
              >
                <v-icon
                  left
                  small
                >
                  mdi-tag-plus
                </v-icon>
                添加匹配
              </v-btn>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-flex>
    </v-flex>
  </v-form>
</template>

<script>
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'
import { required } from '@/utils/rules'

export default {
  name: 'StringMatchForm',
  mixins: [BaseResource],
  props: {
    data: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      valid: false,
      expand: false,
      labelsCopy: {},
      obj: {
        key: '',
        match: '',
        value: '',
      },
      oldKey: null,
    }
  },
  computed: {
    objRules() {
      return {
        keyRule: [required],
        matchRule: [required],
        valueRule: [required],
      }
    },
  },
  watch: {
    data() {
      this.labelsCopy = deepCopy(this.data)
    },
  },
  mounted() {
    if (this.data) {
      this.labelsCopy = deepCopy(this.data)
    }
  },
  methods: {
    getValue(val) {
      if (val.exact) return `exact => ${val.exact}`
      if (val.prefix) return `prefix => ${val.prefix}`
      if (val.regex) return `regex => ${val.regex}`
      return ''
    },
    getKeyValue(val) {
      if (val.exact) return { match: 'exact', value: val.exact }
      if (val.prefix) return { match: 'prefix', value: val.prefix }
      if (val.regex) return { match: 'regex', value: val.regex }
      return {}
    },
    addData() {
      if (this.$refs.form.validate(true)) {
        if (!this.labelsCopy) this.labelsCopy = {}
        if (this.oldKey) this.$delete(this.labelsCopy, this.oldKey)
        this.labelsCopy[this.obj.key] = {}
        this.labelsCopy[this.obj.key][this.obj.match] = this.obj.value
        this.$emit('addData', this.labelsCopy)
        this.closeCard()
      }
    },
    updateLabels(key) {
      const data = this.labelsCopy[key]
      this.obj = {
        key: key,
        ...this.getKeyValue(data),
      }
      this.expandCard()
    },
    removeLabels(key) {
      this.$set(this.labelsCopy, key)
      this.$emit('addData', this.labelsCopy)
    },
    expandCard() {
      this.expand = true
    },
    closeCard() {
      this.expand = false
      this.$refs.form.reset()
      this.oldKey = null
      this.$emit('closeOverlay')
    },
  },
}
</script>
