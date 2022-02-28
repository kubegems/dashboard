<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="更新AI模型"
    icon="mdi-plus"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :edit="true"
      />
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="updateAiModel"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { updateAiModel, aiModelDetail } from '@/api'
import AiModelBaseForm from './AiModelBaseForm'
import BaseFilter from '@/mixins/base_filter'
import BaseSelect from '@/mixins/select'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'UpdateAiModel',
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
    async updateAiModel() {
      if (this.$refs[this.formComponent].$refs.form.validate(true)) {
        const data = deepCopy(this.$refs[this.formComponent].obj)
        await updateAiModel(data)
        this.reset()
        this.$emit('refresh')
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    async init(item) {
      const data = await aiModelDetail(item.ID)
      this.$refs[this.formComponent].setData(data)
    },
    reset() {
      this.dialog = false
      this.$refs[this.formComponent].reset()
    },
  },
}
</script>
