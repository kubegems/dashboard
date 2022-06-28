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
        @input="onAppNameInput"
      />
      <FilterItems title="tasks" />
      <FilterItems title="libraries" />
      <FilterItems title="license" />
    </v-card-text>
  </v-card>
</template>

<script>
  import FilterItems from './FilterItems';

  export default {
    name: 'ModelFilter',
    components: {
      FilterItems,
    },
    data() {
      return {
        search: '',
      };
    },
    methods: {
      onAppNameInput() {},
    },
  };
</script>
