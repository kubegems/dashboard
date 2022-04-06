<template>
  <v-card>
    <TargetsEndpointsForm
      ref="TargetsEndpointsForm"
      :port-items="portItems"
      @saveForm="onSave"
    />

    <BaseSubTitle title="端点配置" />
    <v-sheet class="pa-2">
      <template v-if="endpoints">
        <TargetsEndpointsItem
          v-for="(item, index) in endpoints"
          :key="index"
          :endpoint="item"
          @edit="onEdit(index)"
          @delete="onDelete(index)"
        />
      </template>
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
          添加端点
        </v-btn>
      </div>
    </v-sheet>
  </v-card>
</template>

<script>
import TargetsEndpointsItem from './TargetsEndpointsItem'
import TargetsEndpointsForm from './TargetsEndpointsForm'

export default {
  name: 'TargetsEndpoints',
  components: {
    TargetsEndpointsItem,
    TargetsEndpointsForm,
  },
  props: {
    endpoints: {
      type: Array,
      default: undefined,
    },
    portItems: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    return {
      currentEdit: -1,
    }
  },
  methods: {
    onAdd () {
      this.currentEdit = -1
      this.$refs.TargetsEndpointsForm.show('add')
    },
    onEdit (index) {
      this.currentEdit = index
      this.$refs.TargetsEndpointsForm.show('edit', this.endpoints[index])
    },
    onDelete (index) {
      const endpoints = [...this.endpoints]
      endpoints.splice(index, 1)
      this.$emit('update:endpoints', endpoints)
    },
    onSave (params) {
      const endpoints = [...(this.endpoints || [])]
      if (params.type === 'add') {
        this.$emit('update:endpoints', endpoints.concat([params.data]))
      } else {
        endpoints.splice(this.currentEdit, 1, params.data)
        this.$emit('update:endpoints', endpoints)
      }
    },
  },
}
</script>
