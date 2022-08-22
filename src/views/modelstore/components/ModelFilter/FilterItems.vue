<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
-->
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
        :label="`${title}${$t('tip.name')}`"
        prepend-inner-icon="mdi-magnify"
        solo
        @keyup="onSearch"
      />

      <v-chip v-if="tagHide" class="ml-3 my-1 kubegems__pointer" color="primary" small @click="clearSelect">
        <v-avatar v-if="title !== 'Framework' || hasLogo(tagHide)" left>
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
          <v-avatar v-if="title !== 'Framework' || hasLogo(tag)" left>
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
      <v-chip v-if="orderedTags.length > 12" color="primary mx-3" small @click="searchShow = !searchShow">
        <span v-if="searchShow">
          <v-icon small>mdi-chevron-double-up</v-icon>
        </span>
        <span v-else> + {{ orderedTags.length - 12 }}</span>
      </v-chip>
    </div>
    <div v-if="!tags || orderedTags.length === 0" class="filter__null"> {{ $root.$t('data.no_data') }} </div>
  </div>
</template>

<script>
  import messages from '../../i18n';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'FilterItems',
    i18n: {
      messages: messages,
    },
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
        orderedTags: [],
        tagIndex: undefined,
        tagHide: '',
        orderIndex: ['pytorch', 'tensorflow', 'transformers', 'onnx'],
      };
    },
    computed: {
      shortTags() {
        return this.orderedTags.slice(0, 12);
      },
    },
    watch: {
      tags: {
        handler(newValue) {
          this.orderedTags = [];
          newValue.forEach((t) => {
            const index = this.orderIndex.findIndex((i) => {
              return t.indexOf(i) > -1;
            });
            if (index > -1) {
              this.orderedTags.splice(index, 0, t);
            } else {
              this.orderedTags.push(t);
            }
          });
          this.tagsCopy = deepCopy(this.orderedTags.slice(0, 100));
          const tag = this.$route.query.tags;
          const index = this.orderedTags.findIndex((t) => {
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
          this.tagsCopy = this.orderedTags.filter((t) => {
            return t.toLowerCase().indexOf(this.search.toLowerCase()) > -1;
          });
        } else {
          this.tagsCopy = deepCopy(this.orderedTags.slice(0, 100));
        }
      },
      onTagChange() {
        const t = this.tagsCopy[this.tagIndex];
        const index = this.orderedTags.indexOf(t);
        if (index && index >= 12) {
          this.tagHide = this.orderedTags[index];
          this.tagIndex = -1;
        } else {
          this.tagHide = '';
        }

        this.$emit('search', { [this.title.toLowerCase()]: index > -1 ? this.orderedTags[index] : null });
      },
      clearSelect() {
        this.tagIndex = -1;
        this.onTagChange();
      },
      getLogo(tag) {
        if (this.title === 'Tags') {
          return 'tag';
        }
        if (this.title === 'License') {
          return 'license';
        }
        return tag;
      },
      hasLogo(tag) {
        return this.$MODEL_FRAMEWORK.some((i) => {
          return tag.toLowerCase().indexOf(i) > -1;
        });
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
