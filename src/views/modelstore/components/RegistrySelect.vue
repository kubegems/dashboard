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
  <v-sheet class="text-body-2 text--darken-1 d-flex align-center mx-1">
    <span class="text-body-2 mr-1">{{ $root.$t('header.model_store') }}</span>
    <v-menu v-model="repoMenu" bottom class="mx-1 px-1" left offset-y origin="top center" transition="scale-transition">
      <template #activator="{ on }">
        <v-btn class="primary--text font-weight-medium" color="white" text v-on="on">
          {{ selectRepo.name }}
          <v-icon v-if="repoMenu" right> mdi-chevron-up </v-icon>
          <v-icon v-else right> mdi-chevron-down </v-icon>
        </v-btn>
      </template>
      <v-data-iterator
        class="file-iterator"
        hide-default-footer
        :items="[{ text: $root.$t('header.model_store'), values: repoItems }]"
      >
        <template #no-data>
          <v-card>
            <v-card-text> {{ $root.$t('data.no_data') }} </v-card-text>
          </v-card>
        </template>
        <template #default="props">
          <v-card v-for="item in props.items" :key="item.text" flat min-height="100">
            <v-list dense>
              <v-flex class="text-subtitle-2 text-center ma-2">
                <span>{{ $root.$t('header.model_store') }}</span>
              </v-flex>
              <v-divider class="mx-2" />
              <v-list-item
                v-for="(repo, index) in item.values"
                :key="index"
                class="text-body-2 text-center font-weight-medium mx-2"
                link
                :style="{ color: repo.value === selectRepo.name ? `#1e88e5 !important` : `` }"
                @click="setRepo(repo)"
              >
                <v-list-item-content>
                  <span>{{ repo.text }}</span>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </template>
      </v-data-iterator>
    </v-menu>
  </v-sheet>
</template>

<script>
  import messages from '../i18n';
  import { getModelSourceList } from '@/api';

  export default {
    name: 'RegistrySelect',
    i18n: {
      messages: messages,
    },
    data() {
      return {
        repoMenu: false,
        repoItems: [],
        selectRepo: '',
      };
    },
    watch: {
      value: {
        handler(newValue) {
          if (newValue) {
            this.selectRepo = newValue;
          }
        },
        deep: true,
        immediate: true,
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.modelSourceList();
      });
    },
    methods: {
      setRepo(repo) {
        this.selectRepo = repo;
        this.$emit('change', this.selectRepo);
        this.$emit('input', this.selectRepo);
        this.$router.replace({ query: { ...this.$route.query, registry: this.selectRepo.name } });
      },
      async modelSourceList() {
        const data = await getModelSourceList({ noprocessing: true });
        this.repoItems = data
          .filter((s) => {
            return s.enabled;
          })
          .map((s) => {
            return { text: s.name, value: s.name, ...s };
          });
        if (this.$route.query.registry) {
          this.selectRepo = this.repoItems.find((r) => {
            return r.name === this.$route.query.registry;
          });
          this.$emit('change', this.selectRepo);
          this.$emit('input', this.selectRepo);
        } else if (this.repoItems.length > 0) {
          this.selectRepo = this.repoItems[0];
          this.$emit('change', this.selectRepo);
          this.$emit('input', this.selectRepo);
          this.$router.replace({
            query: { ...this.$route.query, registry: this.selectRepo.name },
          });
        }
      },
    },
  };
</script>
