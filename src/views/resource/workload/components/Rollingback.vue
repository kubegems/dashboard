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
  <BaseDialog v-model="dialog" icon="mdi-redo-variant" :title="$t('operate.rollback')" :width="800" @reset="reset">
    <template #content>
      <BaseSubTitle :title="$root.$t('form.definition', [$t('tip.version')])" />
      <v-card-text class="px-2 pb-0">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-flex class="text-subtitle-1 mb-2">
              {{ $t('tip.now_version') }}
              <span class="text-subtitle-2 primary--text">
                {{ currentVersion }}
              </span>
            </v-flex>

            <v-text-field v-model="search" class="mt-2 pt-0" hide-details prepend-inner-icon="mdi-magnify" />
            <v-sheet max-height="300px">
              <v-data-table
                class="px-0"
                :headers="headers"
                hide-default-footer
                item-key="value"
                :items="versions"
                :items-per-page="params.size"
                :no-data-text="$root.$t('data.no_data')"
                :no-results-text="$root.$t('data.no_data')"
                :page.sync="params.page"
                :search.sync="search"
                show-select
                single-select
                @item-selected="selectVersion"
              >
                <template #[`item.images`]="{ item }">
                  <v-flex v-for="(image, index) in item ? item.images : []" :key="index">
                    {{ image }}
                  </v-flex>
                </template>
              </v-data-table>
            </v-sheet>
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="rollbackWorkload">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../i18n';
  import { getWorkloadVersionList, postRollbackWorkload } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'Rollingback',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      dialog: false,
      valid: false,
      versions: [],
      search: '',
      params: {
        page: 1,
        size: 1000,
      },
      currentVersion: '',
      selectItem: null,
    }),
    computed: {
      ...mapState(['Circular']),
      headers() {
        return [
          { text: this.$t('tip.version'), value: 'value', align: 'start' },
          { text: this.$t('tip.image'), value: 'images', align: 'start' },
          { text: this.$t('tip.publish_at'), value: 'createTime', align: 'start' },
        ];
      },
    },
    methods: {
      open() {
        this.dialog = true;
      },
      init() {
        this.workloadVersionList();
      },
      async workloadVersionList() {
        this.versions = [];
        const data = await getWorkloadVersionList(
          this.ThisCluster,
          this.$route.query.namespace,
          this.$route.query.type,
          this.item.metadata.name,
        );
        data.map((d) => {
          if (!d.current) {
            this.versions.push({
              value: d.revision,
              createTime: d.createTime ? this.$moment(d.createTime).format('lll') : '',
              images: d.images,
            });
          } else {
            this.currentVersion = d.revision;
          }
        });
      },
      selectVersion({ item, value }) {
        if (value) {
          this.selectItem = item;
        } else {
          this.selectItem = null;
        }
      },
      async rollbackWorkload() {
        if (!this.selectItem) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.select_version'),
            color: 'warning',
          });
          return;
        }
        if (this.$refs.form.validate(true)) {
          await postRollbackWorkload(
            this.ThisCluster,
            this.$route.query.namespace,
            this.$route.query.type,
            this.item.metadata.name,
            {
              revision: this.selectItem.value,
            },
          );
          this.$emit('refresh');
          this.reset();
        }
      },
      reset() {
        this.dialog = false;
        this.$refs.form.reset();
        this.selectItem = null;
      },
    },
  };
</script>
