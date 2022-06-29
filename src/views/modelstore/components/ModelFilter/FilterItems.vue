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
        @keyup="onSearch"
      />
      <v-chip-group active-class="primary" class="px-3" column>
        <v-chip v-for="tag in searchShow ? tagsCopy : shortTags" :key="tag" filter small>
          {{ tag }}
        </v-chip>
        <v-chip v-if="tags.length > 15" color="primary" small @click="searchShow = !searchShow">
          <span v-if="searchShow">
            <v-icon small>mdi-chevron-double-up</v-icon>
          </span>
          <span v-else> + {{ tags.length - 15 }}</span>
        </v-chip>
      </v-chip-group>
    </div>
  </div>
</template>

<script>
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'FilterItems',
    props: {
      title: {
        type: String,
        default: () => '',
      },
      tags: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        search: '',
        searchShow: false,
        tagsCopy: [],
      };
    },
    computed: {
      shortTags() {
        return this.tags.slice(0, 15);
      },
    },
    watch: {
      tags: {
        handler(newValue) {
          this.tagsCopy = deepCopy(newValue);
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      onSearch() {
        if (this.search) {
          this.tagsCopy = this.tagsCopy.filter((t) => {
            return t.toLowerCase().indexOf(this.search.toLowerCase()) > -1;
          });
        } else {
          this.tagsCopy = deepCopy(this.tags);
        }
      },
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
