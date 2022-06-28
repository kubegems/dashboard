<template>
  <div>
    <div class="filter__title">{{ title }}</div>
    <div>
      <v-text-field
        v-if="searchShow"
        v-model="search"
        class="mr-4 my-2 ml-2"
        dense
        flat
        hide-details
        :label="`${title}名称`"
        prepend-inner-icon="mdi-magnify"
        solo
      />
      <v-chip-group active-class="primary--text" class="px-3" column>
        <v-chip v-for="tag in tags" :key="tag" small>
          {{ tag }}
        </v-chip>
        <v-chip small> + 16 </v-chip>
      </v-chip-group>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'FilterItems',
    props: {
      title: {
        type: String,
        default: () => '',
      },
      tags: {
        type: Array,
        default: () => [
          'Work',
          'Home Improvement dsd dada',
          'Vacation',
          'Food',
          'Drawers',
          'Shopping',
          'Art',
          'Tech',
          'Creative Writing',
        ],
      },
    },
    data() {
      return {
        search: '',
        searchShow: false,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .filter {
    &__title {
      font-size: 16px;
      margin-left: 12px;
      margin-top: 12px;
    }
  }
</style>
