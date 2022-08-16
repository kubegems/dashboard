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
  <v-container fluid>
    <BaseViewportHeader v-if="!AdminViewport" :environmented="Environment().ID > 0" />
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :default="{ items: [], text: $t('filter.manifest_name'), value: 'search' }"
          :filters="filters"
          @refresh="m_filter_list"
        />
        <v-spacer />
        <v-menu v-if="m_permisson_resourceAllow" left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" v-on="on"> mdi-dots-vertical </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn color="primary" text @click="addApp">
                  <v-icon left>mdi-plus-box</v-icon>
                  {{ $root.$t('operate.create_c', [$root.$t('resource.appmanifest')]) }}
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-card-title>
      <v-card-text>
        <v-data-table
          disable-sort
          :headers="headers"
          hide-default-footer
          :items="items"
          :items-per-page="params.size"
          :no-data-text="$root.$t('data.no_data')"
          :page.sync="params.page"
        >
          <template #[`item.name`]="{ item }">
            <a class="text-subtitle-2 kubegems__inline_flex" @click.stop="appDetail(item)">
              {{ item.name }}
            </a>
          </template>
          <template #[`item.createAt`]="{ item }">
            {{ item.createAt ? $moment(item.createAt).format('lll') : '' }}
          </template>
          <template #[`item.Project`]="{ item }">
            {{ item.Project.ProjectName }}
          </template>
          <template #[`item.images`]="{ item }">
            <v-flex v-for="(image, index) in item.images" :key="index">
              {{ image }}
            </v-flex>
          </template>
          <template #[`item.kind`]="{ item }">
            {{ item.kind === '' ? '未知' : item.kind }}
          </template>
          <template #[`item.labels`]="{ item }">
            <v-chip
              v-for="(value, key) in item.labels"
              :key="key"
              class="ma-1"
              color="success"
              text-color="white"
              x-small
            >
              <strong class="mx-1"> {{ key }} </strong>
              {{ value }}
            </v-chip>
          </template>
          <template #[`item.creator`]="{ item }">
            {{ item.creator }}
          </template>
          <template #[`item.action`]="{ item }">
            <v-flex :id="`r${item.name}`" />
            <v-menu :attach="`#r${item.name}`" left>
              <template #activator="{ on }">
                <v-btn icon>
                  <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-text class="pa-2">
                  <v-flex>
                    <v-btn color="primary" small text @click="updateApp(item)"> {{ $root.$t('operate.edit') }} </v-btn>
                  </v-flex>
                  <v-flex>
                    <v-btn color="error" small text @click="removeApp(item)"> {{ $root.$t('operate.delete') }} </v-btn>
                  </v-flex>
                </v-card-text>
              </v-card>
            </v-menu>
          </template>
        </v-data-table>
        <BasePagination
          v-if="pageCount >= 1"
          v-model="params.page"
          :page-count="pageCount"
          :size="params.size"
          @changepage="onPageIndexChange"
          @changesize="onPageSizeChange"
          @loaddata="appManifestList"
        />
      </v-card-text>
    </v-card>

    <AddApp ref="addApp" @refresh="appManifestList" />
    <UpdateApp ref="updateApp" @refresh="appManifestList" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import AddApp from './components/AddApp';
  import UpdateApp from './components/UpdateApp';
  import messages from './i18n';
  import { deleteManifest, getAllManifest, getManifestList } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import { convertStrToNum } from '@/utils/helpers';

  export default {
    name: 'AppManifest',
    i18n: {
      messages: messages,
    },
    components: {
      AddApp,
      UpdateApp,
    },
    mixins: [BaseFilter, BasePermission, BaseResource],
    data: () => ({
      items: [],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
      },
    }),
    computed: {
      ...mapState(['JWT', 'Admin', 'AdminViewport']),
      ...mapGetters(['Project', 'Tenant']),
      headers() {
        const items = [
          { text: this.$t('table.name'), value: 'name', align: 'start' },
          { text: this.$t('table.label'), value: 'labels', align: 'start' },
          { text: this.$t('table.kind'), value: 'kind', align: 'start' },
          { text: this.$t('table.image'), value: 'images', align: 'start' },
          { text: this.$t('table.creator'), value: 'creator', align: 'start' },
          { text: this.$root.$t('resource.create_at'), value: 'createAt', align: 'start' },
        ];
        if (this.Admin && this.AdminViewport) {
          items.splice(1, 0, {
            text: this.$root.$t('resource.project'),
            value: 'project',
            align: 'start',
          });
        }
        if (this.m_permisson_resourceAllow || this.AdminViewport) {
          items.push({ text: '', value: 'action', align: 'center', width: 20 });
        }
        return items;
      },
      filters() {
        return [{ text: this.$t('filter.manifest_name'), value: 'search', items: [] }];
      },
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          if (!this.AdminViewport && this.Project().ID === 0) {
            return;
          }
          Object.assign(this.params, convertStrToNum(this.$route.query));
          this.appManifestList();
        });
      }
    },
    methods: {
      async appManifestList() {
        let data = {};
        if (this.Admin && this.AdminViewport) {
          data = await getAllManifest(this.params);
        } else {
          data = await getManifestList(
            this.Tenant().ID,
            this.Project().ID,
            Object.assign({ environment_id: this.ThisAppEnvironmentID }, this.params),
          );
        }
        this.items = data.List;
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
        this.$router.replace({ query: { ...this.$route.query, ...this.params } });
      },
      updateApp(item) {
        this.$refs.updateApp.init(
          Object.assign(item, {
            TenantID: this.Tenant().ID,
            ProjectID: this.Project().ID,
            environment_id: this.ThisAppEnvironmentID,
          }),
        );
        this.$refs.updateApp.open();
      },
      appDetail(item) {
        this.$router.push({
          name: 'appmanifest-detail',
          params: Object.assign(this.$route.params, { name: item.name }),
          query: {
            projectid: this.Project().ID,
            tenantid: this.Tenant().ID,
          },
        });
      },
      removeApp(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.create_c', [this.$root.$t('resource.appmanifest')]),
          content: {
            text: `${this.$root.$t('operate.create_c', [this.$root.$t('resource.appmanifest')])} ${item.name}`,
            type: 'delete',
            name: item.name,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteManifest(this.Tenant().ID, this.Project().ID, param.item.name);
            this.appManifestList();
          },
        });
      },
      addApp() {
        this.$refs.addApp.open();
      },
      onPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onPageIndexChange(page) {
        this.params.page = page;
      },
    },
  };
</script>
