<template>
  <v-sheet>
    <v-sheet class="pa-2">
      <BaseListItemForDetail title="匹配应用">
        <template #content>
          <BaseCollapseChips
            v-if="flow"
            :chips="matchs"
            single-line
            icon="mdi-apps"
          />
        </template>
      </BaseListItemForDetail>
      <BaseListItemForDetail title="过滤器">
        <template #content>
          <BaseCollapseChips
            v-if="flow"
            :chips="filters"
            single-line
            icon="mdi-filter"
          />
        </template>
      </BaseListItemForDetail>
      <BaseListItemForDetail title="路由器(Output)">
        <template #content>
          <BaseCollapseChips
            v-if="flow"
            :chips="flow.spec.localOutputRefs"
            single-line
            icon="mdi-router-wireless"
          />
        </template>
      </BaseListItemForDetail>
      <BaseListItemForDetail title="路由器(ClusterOutput)">
        <template #content>
          <BaseCollapseChips
            v-if="flow"
            :chips="flow.spec.globalOutputRefs"
            single-line
            icon="mdi-router-wireless"
          />
        </template>
      </BaseListItemForDetail>
    </v-sheet>
  </v-sheet>
</template>

<script>
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'ResourceInfo',
  props: {
    item: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      flow: null,
    }
  },
  computed: {
    matchs() {
      return this.flow.spec.match.length > 1 ? this.flow.spec.match.reduce((m1, m2) => {
          return Array.isArray(m1) ? m1.concat([m2.select.labels.app])
          : [m1.select.labels.app].concat([m2.select.labels.app])
        }) : this.flow.spec.match.map(m => { return m.select.labels.app })
    },
    filters() {
      return this.flow.spec.filters.length > 1 ? this.flow.spec.filters.reduce((f1, f2) => {
          return Array.isArray(f1) ? f1.concat(Object.keys(f2)) : Object.keys(f1).concat(Object.keys(f2))
        }) : this.flow.spec.filters.map(f => { return Object.keys(f) }).flat()
    },
  },
  watch: {
    item() {
      this.flow = deepCopy(this.item)
    },
  },
  mounted() {
    if (this.item) this.flow = deepCopy(this.item)
  },
}
</script>
