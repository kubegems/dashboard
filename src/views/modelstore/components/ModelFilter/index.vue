<template>
  <v-card>
    <v-card-text class="pa-0 pl-2 pb-2">
      <BaseSubTitle class="pt-2 mb-1" :divider="false" title="模型" />
      <v-text-field
        v-model="search"
        class="mr-4 my-2 ml-2"
        flat
        hide-details
        label="模型名称"
        prepend-inner-icon="mdi-magnify"
        solo
        @keyup.enter="onSearch"
      />
      <FilterItems :tags="tasks" title="tasks" />
      <FilterItems :tags="libraryies" title="libraries" />
      <FilterItems :tags="licenses" title="license" />
    </v-card-text>
  </v-card>
</template>

<script>
  import FilterItems from './FilterItems';
  import { getModelStoreFilterCondition } from '@/api';

  export default {
    name: 'ModelFilter',
    components: {
      FilterItems,
    },
    props: {
      registry: {
        type: String,
        default: () => '',
      },
    },
    data() {
      return {
        search: '',
        libraryies: [],
        licenses: [],
        tasks: [],
      };
    },
    watch: {
      registry: {
        handler(newValue) {
          if (newValue) {
            this.modelStoreFilterCondition();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      onSearch() {
        this.$emit('search', this.search);
      },
      async modelStoreFilterCondition() {
        const data = await getModelStoreFilterCondition();
        this.tasks = data.pipeline_tags;
        this.libraryies = data.library_names;
        this.licenses = data.licenses;
      },
    },
  };
</script>
