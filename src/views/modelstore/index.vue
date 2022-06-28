<template>
  <v-container fluid>
    <Breadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <RegistrySelect v-model="registry" />
        </v-flex>
      </template>
    </Breadcrumb>
    <v-row class="mt-0">
      <v-col class="pt-0" cols="3">
        <ModelFilter />
      </v-col>
      <v-col class="pt-0" cols="9">
        <ModelCard />
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
        registry: '',
      };
    },
  };
</script>
