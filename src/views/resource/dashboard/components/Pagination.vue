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
  <v-flex class="text-center pa-4">
    <v-flex class="pagination-height">
      <v-flex id="smallpagination" class="pagination">
        <v-pagination v-model="p" class="float-right" :length="pageCount" :total-visible="2" @input="onPageInput" />
        <div class="kubegems__clear-float" />
      </v-flex>
    </v-flex>
  </v-flex>
</template>

<script>
  export default {
    name: 'Pagination',
    model: {
      prop: 'page',
    },
    props: {
      frontPage: {
        type: Boolean,
        default: () => false,
      },
      page: {
        type: Number,
        default: () => 1,
      },
      pageCount: {
        type: Number,
        default: () => 0,
      },
    },
    data() {
      return {
        p: 1,
      };
    },
    watch: {
      page() {
        this.p = this.page;
      },
    },
    mounted() {
      this.p = this.page;
    },
    methods: {
      onPageInput() {
        this.$emit('changepage', this.p);
        if (this.p === this.page) return;
        if (!this.frontPage) {
          this.$emit('loaddata');
        } else {
          if (this.p === 1) {
            this.$emit('loaddata');
          }
        }
      },
    },
  };
</script>

<style lang="scss">
  #smallpagination {
    position: absolute;
    right: 10px;
    transform: translate(0%, 0%);
  }

  .pagination-height {
    height: 40px;
  }

  #smallpagination .v-pagination__navigation {
    width: 24px;
    height: 24px;
  }

  #smallpagination .v-pagination__item {
    width: 24px;
    height: 24px;
    min-width: 0;
  }
</style>
