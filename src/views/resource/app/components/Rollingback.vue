<!-- 
  Copyright 2022 The kubegems.io Authors

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License. 
-->

<template>
  <BaseDialog v-model="dialog" icon="fas fa-redo-alt" title="回滚" :width="800" @reset="reset">
    <template #content>
      <BaseSubTitle title="版本定义" />
      <v-card-text class="px-2 pb-0">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-flex class="text-subtitle-1 mb-2">
              当前版本
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
                no-data-text="暂无数据"
                no-results-text="暂无匹配版本"
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
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="rollback"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import { getStrategyDeployStatus, postStrategyDeployEnvironmentAppsControl } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'Rollingback',
    mixins: [BaseResource],
    data: () => ({
      dialog: false,
      valid: false,
      versions: [],
      headers: [
        { text: '版本', value: 'value', align: 'start' },
        { text: '镜像', value: 'images', align: 'start' },
        { text: '发布时间', value: 'createTime', align: 'start' },
      ],
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
      ...mapGetters(['Tenant', 'Project', 'Environment']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      init() {
        this.rsVersionList();
      },
      async rsVersionList() {
        this.versions = [];
        const data = await getStrategyDeployStatus(
          this.Tenant().ID,
          this.Project().ID,
          this.Environment().ID,
          this.$route.params.name,
        );
        if (data && data.replicaSets) {
          data.replicaSets.map((r, index) => {
            if (index === 0) this.currentVersion = r.revision;
            this.versions.push({
              value: r.revision,
              createTime: r.objectMeta.creationTimestamp
                ? this.$moment(r.objectMeta.creationTimestamp).format('lll')
                : '',
              images: r.images,
            });
          });
        }
      },
      selectVersion({ item, value }) {
        if (value) {
          this.selectItem = item;
        } else {
          this.selectItem = null;
        }
      },
      rollback() {
        this.$store.commit('SET_CONFIRM', {
          title: '回滚',
          content: {
            text: `回滚版本 ${this.selectItem.value}`,
            type: 'confirm',
            name: this.$route.params.name,
          },
          param: {},
          doFunc: async () => {
            await postStrategyDeployEnvironmentAppsControl(
              this.Tenant().ID,
              this.Project().ID,
              this.Environment().ID,
              this.$route.params.name,
              {
                command: 'undo',
                args: {
                  revision: `${this.selectItem.value}`,
                },
              },
            );
            this.reset();
          },
        });
      },
      reset() {
        this.dialog = false;
        this.$refs.form.reset();
        this.selectItem = null;
      },
    },
  };
</script>
