<template>
  <v-autocomplete
    v-model="current"
    dense
    flat
    hide-details
    hide-selected
    :items="projectItems"
    label="请选择项目进行过滤"
    no-data-text="暂无可选数据"
    prepend-inner-icon="mdi-magnify"
    solo
    :style="{ maxWidth: `500px` }"
    @change="onProjectChange"
  >
    <template #selection="{ item }">
      <v-chip color="primary" label small> 项目: {{ item.text }} </v-chip>
    </template>
  </v-autocomplete>
</template>

<script>
  import { getProjectList } from '@/api';

  export default {
    name: 'ProjectSelect',
    props: {
      tenant: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        current: undefined,
        projectItems: [],
      };
    },
    watch: {
      tenant: {
        handler: function () {
          if (this.tenant) {
            this.getTenantProjectList();
          }
        },
        deep: true,
      },
    },
    methods: {
      async getTenantProjectList() {
        const data = await getProjectList(this.tenant.ID, { size: 1000, noprocessing: true });
        this.projectItems = data.List.map((item) => {
          return {
            text: item.ProjectName,
            value: item.ID,
          };
        });
        if (this.projectItems.length > 0) {
          this.current = this.projectItems[0].value;
          this.$emit('input', this.current);
          this.$emit('change', this.current);
        }
      },
      onProjectChange() {
        this.$emit('input', this.current);
        this.$emit('change', this.current);
      },
    },
  };
</script>
