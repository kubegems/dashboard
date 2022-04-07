<template>
  <v-card>
    <TargetsLabelsForm
      ref="TargetsLabelsForm"
      @save-form="onSave"
    />

    <BaseSubTitle title="标签配置" />
    <v-sheet class="pa-2">
      <div class="d-flex justify-space-between flex-wrap">
        <TargetsLabelsItem
          v-for="(value, key) in (labels || {})"
          :key="key"
          :label-key="key"
          :label-value="value"
          style="width: calc(50% - 6px);"
          @edit="onEdit(key)"
          @delete="onDelete(key)"
        />
      </div>

      <div class="grey lighten-4 text-center my-2 py-3">
        <v-btn
          text
          color="primary"
          @click="onAdd"
        >
          <v-icon
            left
            small
          >
            mdi-plus
          </v-icon>
          添加标签
        </v-btn>
      </div>
    </v-sheet>
  </v-card>
</template>

<script>
import TargetsLabelsItem from './TargetsLabelsItem'
import TargetsLabelsForm from './TargetsLabelsForm'

export default {
  name: 'TargetsLabels',
  components: {
    TargetsLabelsItem,
    TargetsLabelsForm,
  },
  props: {
    labels: {
      type: Object,
      default: undefined,
    },
  },
  methods: {
    onAdd () {
      this.$refs.TargetsLabelsForm.show('add')
    },
    onEdit (key) {
      this.$refs.TargetsLabelsForm.show('edit', {
        key,
        value: this.labels[key],
      })
    },
    onDelete (key) {
      const labels = { ...this.labels }
      delete labels[key]
      this.$emit('update:labels', labels)
    },
    onSave (params) {
      const labels = { ...this.labels }
      labels[params.data.key] = params.data.value
      this.$emit('update:labels', labels)
    },
  },
}
</script>
