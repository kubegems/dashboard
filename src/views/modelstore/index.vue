<template>
  <v-container fluid>
    <Breadcrumb :hub="registry ? registry.name : ''">
      <template #extend>
        <v-flex class="kubegems__full-right">
          <RegistrySelect v-model="registry" />
        </v-flex>
      </template>
    </Breadcrumb>
    <v-row class="mt-0">
      <v-col class="pt-0" cols="3">
        <ModelFilter :registry="registry" @filter="filter" @search="search" />
      </v-col>
      <v-col class="pt-0" cols="9">
        <ModelCard ref="modelCard" :registry="registry" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import Breadcrumb from './components/Breadcrumb';
  import ModelCard from './components/ModelCard';
  import ModelFilter from './components/ModelFilter';
  import RegistrySelect from './components/RegistrySelect';

  export default {
    name: 'ModelStoreCenter',
    components: {
      Breadcrumb,
      ModelCard,
      ModelFilter,
      RegistrySelect,
    },
    data() {
      return {
        registry: null,
      };
    },
    methods: {
      search(search) {
        this.$refs.modelCard.search(search);
      },
      filter(filter) {
        this.$refs.modelCard.filter(filter);
      },
    },
  };
</script>
