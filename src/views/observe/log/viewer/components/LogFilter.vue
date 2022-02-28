<template>
  <v-flex>
    <v-combobox
      v-model="model"
      :search-input.sync="filter"
      multiple
      solo
      dense
      flat
      full-width
      hide-details
      :disabled="disabled"
      :hide-no-data="!filter"
      @keydown.enter="handleEnter"
    >
      <template #selection="{ attrs, item, selected }">
        <v-chip
          v-if="item === Object(item)"
          :input-value="selected"
          color="primary"
          label
          small
          v-bind="attrs"
          class="chip-margin"
        >
          <span class="pr-2">{{ item.text }}</span>
          <v-icon
            small
            @click="deleteItem(item)"
          >
            mdi-close
          </v-icon>
        </v-chip>
        <span v-else>{{ item.text }}</span>
      </template>
    </v-combobox>
  </v-flex>
</template>

<script>
import BaseSelect from '@/mixins/select'

export default {
  name: 'LogFilter',
  mixins: [BaseSelect],
  data: () => ({
    model: [],
    filter: '',
    disabled: false,
  }),
  computed: {
    regexStr() {
      let res = ''
      this.model.forEach((item) => {
        if (item.text && item.text.indexOf('正则') > -1) {
          if (item.value !== '') {
            res = res + `|~ \`${item.value}\``
          }
        }
      })
      return res
    },
  },
  watch: {
    regexStr() {
      this.$emit('updateRegex', this.regexStr)
    },
    model(val, prev) {
      // 长度相等则添加成功
      if (val.length === prev.length) return

      this.model = val.map((v) => {
        if (typeof v === 'string' && v !== '') {
          v = {
            text: `正则:${v}`,
            value: v,
          }
        }

        return v
      })
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    input() {
      this.model = this.model.filter(
        (item) => item.text && item.text.indexOf(':') > -1,
      )
    },
    deleteItem(deleteObj) {
      this.model = this.model.filter(
        (item) =>
          item.value !== deleteObj.value || item.text !== deleteObj.text,
      )
      if (deleteObj.text.indexOf('正则') === -1) {
        // 如果是标签(非正则)
        const label = deleteObj.text.split(':')[0]
        const value = deleteObj.text.split(':')[1]
        this.$emit('deleteLabelValue', label, value)
      }
    },

    // eslint-disable-next-line vue/no-unused-properties
    clickLabelValues(labelClick, labelValue) {
      const comboboxModelData = {
        text: `${labelClick}:${labelValue}`,
        value: `${labelClick}:${labelValue}`,
      }
      let comboboxModelDataIndex = -1
      this.model.forEach((item, index) => {
        if (item.value === comboboxModelData.value) {
          comboboxModelDataIndex = index
        }
      })
      if (comboboxModelDataIndex === -1) {
        this.model.push(comboboxModelData)
      } else {
        this.model.splice(comboboxModelDataIndex, 1)
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    confirmLabels(selectedLabelValueList) {
      // 去掉标签只保留正则
      this.model = this.model.filter(
        (item) => item.text && item.text.indexOf('正则') > -1,
      )
      selectedLabelValueList.forEach((item) => {
        if (item.label !== 'tenant') {
          this.model.push({
            text: `${item.label}:${item.labelValue}`,
            value: `${item.label}:${item.labelValue}`,
          })
        }
      })
    },
    handleEnter() {
      this.$emit('enterdown')
    },
  },
}
</script>

<style lang="scss" scoped>
.chip-margin {
  margin: 1px 3px !important;
}
</style>
