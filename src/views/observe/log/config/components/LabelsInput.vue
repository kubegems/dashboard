<template>
  <Card :no-title="type === 'block'">
    <v-btn
      slot="title"
      small
      color="primary"
      @click="onAddLabel"
    >
      {{ title }}<v-icon right>mdi-plus</v-icon>
    </v-btn>

    <div
      v-for="(item, index) in labelArr"
      :key="item._$key"
      class="d-flex"
    >
      <v-row>
        <v-col cols="6">
          <v-combobox
            v-if="keyItems.length"
            v-model="labelArr[index].key"
            label="key"
            :items="keyItems"
            :rules="formRules.key"
          />
          <v-text-field
            v-else
            v-model="labelArr[index].key"
            label="key"
            :items="keyItems"
            :rules="formRules.key"
          />
        </v-col>
        <v-col cols="6">
          <v-combobox
            v-if="valueItems.length"
            v-model="labelArr[index].value"
            label="value"
            :items="valueItems"
            :rules="formRules.value"
          />
          <v-text-field
            v-else
            v-model="labelArr[index].value"
            label="value"
            :items="valueItems"
            :rules="formRules.value"
          />
        </v-col>
      </v-row>

      <v-btn
        color="error"
        small
        class="ml-4 mt-6"
        text
        @click="onRemoveLabel(index)"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </div>

    <v-btn
      v-if="type === 'block'"
      text
      block
      color="primary"
      @click="onAddLabel"
    >
      <v-icon left>mdi-plus</v-icon>{{ title }}
    </v-btn>
  </Card>
</template>

<script>
import Card from '@/views/observe/log/operator/components/Card'
import { required } from '@/utils/rules'

export default {
  name: 'LabelsInput',
  components: {
    Card,
  },
  props: {
    labels: {
      type: Object,
      default: () => ({}),
    },
    title: {
      type: String,
      default: 'labels',
    },
    keyItems: {
      type: Array,
      default: () => [],
    },
    valueItems: {
      type: Array,
      default: () => [],
    },
    type: {
      type: String,
      default: 'default',
    },
  },
  data() {
    this.formRules = {
      key: [required],
      value: [required],
    }
    return {
      labelArr: [],
    }
  },
  watch: {
    labels: {
      handler(newValue) {
        const labels = newValue || {}
        this.labelArr = Object.keys(labels).map((key, index) => ({
          _$key: index,
          value: labels[key],
          key,
        }))
      },
      immediate: true,
    },
  },
  methods: {
    onAddLabel() {
      this.labelArr.push({
        _$key: Date.now(),
        value: undefined,
        key: undefined,
      })
    },
    onRemoveLabel(index) {
      this.labelArr.splice(index, 1)
    },
    // eslint-disable-next-line vue/no-unused-properties
    getValue() {
      return this.labelArr.length
        ? this.labelArr.reduce((pre, current) => {
            pre[current.key] = current.value
            return pre
          }, {})
        : undefined
    },
  },
}
</script>
