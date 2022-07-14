<template>
  <div>
    <div class="filter__title text-subtitle-2">{{ title }}</div>
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

      <v-chip v-if="tagHide" class="ml-3 my-1 kubegems__pointer" color="primary" small @click="clearSelect">
        <v-avatar left>
          <BaseLogo
            class="filter__logo"
            :default-logo="title.toLowerCase()"
            :icon-name="getLogo(tagHide)"
            :ml="0"
            :width="18"
          />
        </v-avatar>
        {{ tagHide }}
      </v-chip>
      <v-chip-group v-model="tagIndex" active-class="primary" class="px-3" column @change="onTagChange">
        <v-chip v-for="tag in searchShow ? tagsCopy : shortTags" :key="tag" class="my-1" small>
          <v-avatar left>
            <BaseLogo
              class="filter__logo"
              :default-logo="title.toLowerCase()"
              :icon-name="getLogo(tag)"
              :ml="0"
              :width="18"
            />
          </v-avatar>
          {{ tag }}
        </v-chip>
      </v-chip-group>
      <v-chip v-if="tags.length > 20" color="primary mx-3" small @click="searchShow = !searchShow">
        <span v-if="searchShow">
          <v-icon small>mdi-chevron-double-up</v-icon>
        </span>
        <span v-else> + {{ tags.length - 20 }}</span>
      </v-chip>
    </div>
    <div v-if="!tags || tags.length === 0" class="filter__null"> 暂无数据 </div>
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
        tagIndex: undefined,
        tagHide: '',
      };
    },
    computed: {
      shortTags() {
        return this.tags.slice(0, 20);
      },
    },
    watch: {
      tags: {
        handler(newValue) {
          this.tagsCopy = deepCopy(newValue.slice(0, 100));
          const tag = this.$route.query.tags;
          const index = this.tags.findIndex((t) => {
            return t === tag;
          });
          if (index > -1) {
            this.tagHide = tag;
            this.tagIndex = this.tagsCopy.indexOf(tag);
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      onSearch() {
        if (this.search) {
          this.tagsCopy = this.tags.filter((t) => {
            return t.toLowerCase().indexOf(this.search.toLowerCase()) > -1;
          });
        } else {
          this.tagsCopy = deepCopy(this.tags.slice(0, 100));
        }
      },
      onTagChange() {
        const t = this.tagsCopy[this.tagIndex];
        const index = this.tags.indexOf(t);
        if (index && index >= 20) {
          this.tagHide = this.tags[index];
          this.tagIndex = -1;
        } else {
          this.tagHide = '';
        }

        this.$emit('search', { [this.title.toLowerCase()]: index > -1 ? this.tags[index] : null });
      },
      clearSelect() {
        this.tagIndex = -1;
        this.onTagChange();
      },
      getLogo(tag) {
        if (this.title === 'Tags') {
          return 'tag';
        }
        return tag;
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

    &__null {
      text-align: center;
      height: 130px;
      line-height: 130px;
    }

    &__logo {
      margin-top: 2px;
    }
  }
</style>
