<template>
  <v-simple-table class="mx-2 pa-2 pb-3">
    <template #default>
      <thead>
        <tr>
          <th class="text-left">环境变量(容器)</th>
          <th class="text-left">类型</th>
          <th class="text-left">值(value/name(key)/fieldPath/containerName(resource))</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in envs"
          :key="index"
        >
          <td>{{ item.name }} ({{ item.containerName }})</td>
          <td>{{ getType(item) }}</td>
          <td>{{ getValue(item) }}</td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script>
export default {
  name: 'DetailEnv',
  props: {
    containers: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      envs: [],
    }
  },
  watch: {
    containers: {
      handler(newValue) {
        this.envs = []
        newValue.forEach(c => {
          this.envs = this.envs.concat(c.env.map(e => { return {...e, containerName: c.name} }))
        })
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    getType(item) {
      if (Object.prototype.hasOwnProperty.call(item, 'value')) {
        return 'key-value'
      }
      if (item.valueFrom.secretKeyRef) {
        return 'secret'
      }
      if (item.valueFrom.configMapKeyRef) {
        return 'configmap'
      }
      if (item.valueFrom.fieldRef) {
        return 'downward (pod)'
      }
      if (item.valueFrom.resourceFieldRef) {
        return 'downward (container)'
      }
      return 'unknown'
    },
    getValue(item) {
      if (Object.prototype.hasOwnProperty.call(item, 'value')) {
        return item.value
      }
      if (item.valueFrom.secretKeyRef) {
        return `${item.valueFrom.secretKeyRef?.name} (${item.valueFrom.secretKeyRef?.key})`
      }
      if (item.valueFrom.configMapKeyRef) {
        return `${item.valueFrom.configMapKeyRef?.name} (${item.valueFrom.configMapKeyRef?.key})`
      }
      if (item.valueFrom.fieldRef) {
        return item.valueFrom.fieldRef?.fieldPath
      }
      if (item.valueFrom.resourceFieldRef) {
        return `${item.valueFrom.resourceFieldRef?.containerName} (${item.valueFrom.resourceFieldRef?.resource})`
      }
      return 'unknown'
    },
  },
}
</script>
