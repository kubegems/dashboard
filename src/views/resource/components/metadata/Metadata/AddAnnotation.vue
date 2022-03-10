<template>
  <BaseDialog
    v-model="dialog"
    :width="500"
    title="添加注解"
    icon="mdi-tag-plus"
    @reset="reset"
  >
    <template #content>
      <BaseSubTitle title="注解定义" />
      <v-card-text class="pa-2">
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
          @submit.prevent
        >
          <v-sheet>
            <v-text-field
              v-model="obj.key"
              class="my-0"
              required
              label="键"
              :rules="objRules.keyRule"
            />
            <v-text-field
              v-model="obj.value"
              class="my-0"
              required
              label="值"
              :rules="objRules.valueRule"
            />
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="addAnnotation"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { patchMetadataNode } from '@/api'
import BaseResource from '@/mixins/resource'
import { k8sAnnotation, required } from '@/utils/rules'

export default {
  name: 'AddAnnotation',
  mixins: [BaseResource],
  props: {
    item: {
      type: Object,
      default: () => null,
    },
  },
  data: () => ({
    dialog: false,
    valid: false,
    metadata: null,
    obj: {
      key: '',
      value: '',
    },
  }),
  computed: {
    ...mapState(['Circular']),
    objRules() {
      return {
        keyRule: [
          required,
          k8sAnnotation,
        ],
        valueRule: [
          required,
          k8sAnnotation,
        ],
      }
    },
  },
  watch: {
    item() {
      this.metadata = this.item.metadata
    },
  },
  mounted() {
    if (this.item) this.metadata = this.item.metadata
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    async addAnnotation() {
      if (this.$refs.form.validate(true)) {
        this.metadata.annotations[this.obj.key] = this.obj.value
        await patchMetadataNode(this.ThisCluster, this.item.metadata.name, {
          Annotations: this.metadata.annotations,
          Labels: this.metadata.labels,
        })
        this.$emit('refresh', this.obj, 'annotation')
        this.reset()
      }
    },
    reset() {
      this.dialog = false
      this.$refs.form.reset()
    },
  },
}
</script>
