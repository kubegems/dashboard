<template>
  <Card :no-title="type === 'block'">
    <v-btn
      slot="title"
      small
      color="primary"
      :disabled="cloneTags.length >= maxLength"
      @click="onAddTag"
    >
      {{ title }}<v-icon right>mdi-plus</v-icon>
    </v-btn>

    <v-row>
      <v-col
        v-for="(item, index) in cloneTags"
        :key="item._$key"
        :cols="cols"
        class="d-flex pb-0"
      >
        <v-text-field
          v-model="cloneTags[index].value"
          :label="label"
          :rules="formRules.value"
        />
        <v-btn
          color="error"
          small
          class="ml-4 mt-6"
          text
          @click="onRemoveTag(index)"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-col>

      <v-col
        v-if="type === 'block'"
        cols="12"
      >
        <v-btn
          text
          block
          color="primary"
          :disabled="cloneTags.length >= maxLength"
          @click="onAddTag"
        >
          <v-icon left>mdi-plus</v-icon>{{ title }}
        </v-btn>
      </v-col>
    </v-row>
  </Card>
</template>

<script>
import Card from '@/views/observe/log/operator/components/Card'
import { required } from '@/utils/rules'

export default {
  name: 'MatchLabels',
  components: {
    Card,
  },
  props: {
    tags: {
      type: Array,
      default: () => [],
    },
    label: {
      type: String,
      default: 'tag',
    },
    title: {
      type: String,
      default: 'tags',
    },
    maxLength: {
      type: Number,
      default: 66,
    },
    cols: {
      type: [Number, String],
      default: '12',
    },
    type: {
      type: String,
      default: 'default',
    },
  },
  data() {
    this.formRules = {
      value: [required],
    }

    return {
      cloneTags: [],
    }
  },
  watch: {
    tags: {
      handler(newValue) {
        this.cloneTags = (newValue || []).map((name, index) => ({
          _$key: index,
          value: name,
        }))
      },
      immediate: true,
    },
  },
  methods: {
    onAddTag() {
      this.cloneTags.push({
        _$key: Date.now(),
        value: undefined,
      })
    },
    onRemoveTag(index) {
      this.cloneTags.splice(index, 1)
    },
    // eslint-disable-next-line vue/no-unused-properties
    getValue() {
      return this.cloneTags.length
        ? this.cloneTags.map((n) => n.value)
        : undefined
    },
  },
}
</script>
