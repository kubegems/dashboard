<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="创建AI模型"
    icon="mdi-plus"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="addAiModel"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { addAiModel } from '@/api'
import AiModelBaseForm from './AiModelBaseForm'
import BaseFilter from '@/mixins/base_filter'
import BaseSelect from '@/mixins/select'

export default {
  name: 'AddCluster',
  components: {
    AiModelBaseForm,
  },
  mixins: [BaseFilter, BaseSelect],
  data: () => ({
    dialog: false,
    formComponent: 'AiModelBaseForm',
  }),
  computed: {
    ...mapState(['Circular']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async addAiModel() {
      if (this.$refs[this.formComponent].$refs.form.validate(true)) {
        const data = this.$refs[this.formComponent].obj
        await addAiModel(data)
        this.reset()
        this.$emit('refresh')
      }
    },
    reset() {
      this.dialog = false
      this.$refs[this.formComponent].reset()
    },
  },
}
</script>
