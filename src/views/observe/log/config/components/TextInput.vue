<template>
  <Card>
    <v-btn
      slot="title"
      small
      color="primary"
      :disabled="showInput"
      @click="showInput"
    >
      {{ title }}<v-icon right>mdi-plus</v-icon>
    </v-btn>

    <Card
      v-if="showInput"
      :title="label"
    >
      <div class="d-flex">
        <v-text-field
          v-model="cloneValue"
          :label="label"
          :rules="formRules.value"
        />

        <v-btn
          color="error"
          small
          class="ml-4 mt-6"
          text
          @click="onHiddenInput"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </div>
    </Card>
  </Card>
</template>

<script>
import Card from '@/views/observe/log/operator/components/Card'
import { required } from '@/utils/rules'

export default {
  name: 'TextInput',
  components: {
    Card,
  },
  props: {
    value: {
      type: String,
      default: undefined,
    },
    label: {
      type: String,
      default: 'tag',
    },
    title: {
      type: String,
      default: 'tags',
    },
  },
  data() {
    this.formRules = {
      value: [required],
    }

    return {
      showInput: false,
      cloneValue: undefined,
    }
  },
  watch: {
    value: {
      handler(newValue) {
        this.showInput = !!newValue
        this.cloneValue = newValue
      },
      immediate: true,
    },
  },
  methods: {
    onHiddenInput() {
      this.showInput = false
      this.cloneValue = undefined
    },
    // eslint-disable-next-line vue/no-unused-properties
    show() {
      this.showInput = true
    },
    // eslint-disable-next-line vue/no-unused-properties
    getValue() {
      return this.cloneValue || undefined
    },
  },
}
</script>
