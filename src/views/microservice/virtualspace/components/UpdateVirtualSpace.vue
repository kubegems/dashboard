<template>
  <BaseDialog
    v-model="dialog"
    :width="1000"
    title="更新虚拟空间"
    icon="mdi-cloud-outline"
    @reset="reset"
  >
    <template #content>
      <component
        :is="formComponent"
        :ref="formComponent"
        :step="step"
        :edit="true"
        :item="item"
        title="虚拟空间"
        @refresh="refresh"
      />
    </template>
    <template #action>
      <v-btn
        v-if="step === totalStep - 1"
        class="float-right mx-2"
        color="primary"
        text
        :loading="Circular"
        @click="updateVirtualSpace"
      >
        确定
      </v-btn>
      <v-btn
        v-if="step >= 0 && step < totalStep - 1"
        class="float-right mx-2"
        color="primary"
        text
        @click="nextStep"
      >
        下一步
      </v-btn>
      <v-btn
        v-if="step > 0 && step <= totalStep - 1"
        class="float-right mx-2"
        color="primary"
        text
        @click="lastStep"
      >
        上一步
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { getVirtualSpaceDetail, putUpdateVirtualSpace } from '@/api'
import VirtualSpaceBaseForm from './VirtualSpaceBaseForm'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'UpdateVirtualSpace',
  components: {
    VirtualSpaceBaseForm,
  },
  mixins: [BaseResource],
  data: () => ({
    dialog: false,
    formComponent: 'VirtualSpaceBaseForm',
    step: 0,
    totalStep: 3,
    item: null,
  }),
  computed: {
    ...mapState(['Circular', 'AdminViewport']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async updateVirtualSpace() {
      if (this.$refs[this.formComponent].validate()) {
        const data = this.$refs[this.formComponent].getData()
        await putUpdateVirtualSpace(data.ID, {
          VirtualSpaceName: data.VirtualSpaceName,
        })
        this.reset()
        this.$emit('refresh')
      }
    },
    lastStep() {
      if (this.step > 0) {
        const data = this.$refs[this.formComponent].getData()
        this.step -= 1
        this.$nextTick(() => {
          this.$refs[this.formComponent].back(data)
        })
      }
    },
    nextStep() {
      if (
        this.step === 1 &&
        this.$refs[this.formComponent].obj.Environments.length === 0
      ) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请关联环境',
          color: 'warning',
        })
        return
      }
      if (
        this.step < this.totalStep - 1 &&
        this.$refs[this.formComponent].validate()
      ) {
        const data = this.$refs[this.formComponent].getData()
        this.step += 1
        this.$nextTick(() => {
          this.$refs[this.formComponent].init(data)
        })
      }
    },
    // eslint-disable-next-line vue/no-unused-properties
    async init(item) {
      this.formComponent = 'VirtualSpaceBaseForm'
      const data = await getVirtualSpaceDetail(item.ID)
      this.item = deepCopy(data)
    },
    reset() {
      this.dialog = false
      this.$refs[this.formComponent].reset()
      this.step = 0
      this.formComponent = 'VirtualSpaceBaseForm'
    },
    refresh() {
      this.$emit('refresh')
    },
  },
}
</script>
