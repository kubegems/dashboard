<template>
  <v-autocomplete
    v-model="current"
    :items="cmsItems"
    solo
    flat
    dense
    prepend-inner-icon="mdi-magnify"
    hide-details
    hide-selected
    clearable
    label="请选择项目进行过滤"
    style="max-width: 500px;"
    no-data-text="暂无可选数据"
  >
    <template #selection="{ item }">
      <v-chip
        color="primary"
        small
      >
        {{ item.text }}
      </v-chip>
    </template>
  </v-autocomplete>
</template>

<script>
import { mapGetters } from 'vuex'
import { getProjectList } from '@/api'

export default {
  name: 'CmsSelect',
  data () {
    return {
      current: undefined,
      cmsItems: [],
    }
  },
  computed: {
    ...mapGetters(['Tenant']),
  },
  mounted () {
    this.getTenantProjectList()
  },
  methods: {
    async getTenantProjectList () {
      const data = await getProjectList(this.Tenant().ID, { size: 999 })
      this.cmsItems = data.List.map(item => {
        return {
          text: item.ProjectName,
          value: item.ID,
        }
      })
    },
  },
}
</script>
