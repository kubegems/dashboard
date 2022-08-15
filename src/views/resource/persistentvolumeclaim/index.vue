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
    <BaseViewportHeader />
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :default="{ items: [], text: $t('filter.pvc_name'), value: 'search' }"
          :filters="filters"
          @refresh="m_filter_list"
        />
        <NamespaceFilter />
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
                <v-btn color="primary" text @click="addPersistentVolumeClaim">
                  <v-icon left>mdi-database-plus</v-icon>
                  {{ $root.$t('operate.create_c', [$root.$t('resource.persistentvolumeclaim')]) }}
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn
                  color="error"
                  text
                  @click="
                    m_table_batchRemoveResource(
                      $root.$t('resource.persistentvolumeclaim'),
                      'PersistentVolumeClaim',
                      persistentVolumeClaimList,
                    )
                  "
                >
                  <v-icon left>mdi-minus-box</v-icon>
                  {{ $root.$t('operate.delete_c', [$root.$t('resource.persistentvolumeclaim')]) }}
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-card-title>
      <v-data-table
        class="mx-4"
        :headers="headers"
        hide-default-footer
        :items="items"
        :items-per-page="params.size"
        :no-data-text="$root.$t('data.no_data')"
        :page.sync="params.page"
        show-select
        @toggle-select-all="m_table_onResourceToggleSelect"
        @update:sort-by="m_table_sortBy"
        @update:sort-desc="m_table_sortDesc"
      >
        <template #[`item.data-table-select`]="{ item, index }">
          <v-checkbox
            v-model="m_table_batchResources[`${item.metadata.name}-${index}`].checked"
            color="primary"
            hide-details
            @change="m_table_onResourceChange($event, item, index)"
            @click.stop
          />
        </template>
        <template #[`item.name`]="{ item }">
          <a class="text-subtitle-2 kubegems__inline_flex" @click.stop="persistentVolumeClaimDetail(item)">
            {{ item.metadata.name }}
          </a>
        </template>
        <template #[`item.namespace`]="{ item }">
          {{ item.metadata.namespace }}
        </template>
        <template #[`item.type`]="{ item }">
          {{ item.spec.storageClassName }}
        </template>
        <template #[`item.status`]="{ item }">
          {{ item.metadata.deletionTimestamp ? 'Terminating' : item.status.phase }}
        </template>
        <template #[`item.mount`]="{ item }">
          <span
            :class="`v-avatar mr-2`"
            :style="{
              height: '10px',
              minWidth: '10px',
              width: '10px',
              backgroundColor: `${
                $PVC_STATUS_COLOR[
                  item.metadata.annotations ? item.metadata.annotations[`storage.kubegems.io/in-use`] : 'undefined'
                ]
              }`,
            }"
          />
          <span> {{ getMountStatus(item) }} </span>
        </template>
        <template #[`item.accessMode`]="{ item }">
          {{ item.spec.accessModes[0] }}
        </template>
        <template #[`item.storage`]="{ item }">
          {{
            isNaN(item.spec.resources.requests.storage)
              ? item.spec.resources.requests.storage
              : `${parseInt(item.spec.resources.requests.storage) / 1024 / 1024 / 1024}Gi`
          }}
        </template>
        <template #[`item.createAt`]="{ item }">
          {{ item.metadata.creationTimestamp ? $moment(item.metadata.creationTimestamp).format('lll') : '' }}
        </template>
        <template #[`item.action`]="{ item }">
          <v-flex :id="`r${item.metadata.resourceVersion}`" />
          <v-menu :attach="`#r${item.metadata.resourceVersion}`" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2 text-center">
                <v-flex>
                  <v-btn color="primary" small text @click="updatePersistentVolumeClaim(item)">
                    {{ $root.$t('operate.edit') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="primary" small text @click="scalePersistentVolumeClaim(item)">
                    {{ $t('operate.scale') }}
                  </v-btn>
                </v-flex>
                <v-flex
                  v-if="
                    item.metadata.annotations &&
                    item.metadata.annotations[`storage.kubegems.io/allow-snapshot`] &&
                    item.metadata.annotations[`storage.kubegems.io/allow-snapshot`] === 'true'
                  "
                >
                  <v-btn color="primary" small text @click="addVolumeSnapshot(item)">
                    {{ $t('operate.create_snapshot') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removePersistentVolumeClaim(item)">
                    {{ $root.$t('operate.delete') }}
                  </v-btn>
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
        @loaddata="persistentVolumeClaimList"
      />
    </v-card>

    <AddPersistentVolumeClaim ref="addPersistentVolumeClaim" @refresh="persistentVolumeClaimList" />
    <UpdatePersistentVolumeClaim ref="updatePersistentVolumeClaim" @refresh="persistentVolumeClaimList" />
    <ScalePersistentVolumeClaim ref="scalePersistentVolumeClaim" @refresh="persistentVolumeClaimList" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import AddPersistentVolumeClaim from './components/AddPersistentVolumeClaim';
  import ScalePersistentVolumeClaim from './components/ScalePersistentVolumeClaim';
  import UpdatePersistentVolumeClaim from './components/UpdatePersistentVolumeClaim';
  import messages from './i18n';
  import { deletePersistentVolumeClaim, getPersistentVolumeClaimList, postAddVolumeSnapshot } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseTable from '@/mixins/table';
  import NamespaceFilter from '@/views/resource/components/common/NamespaceFilter';

  export default {
    name: 'PersistentVolumeClaim',
    i18n: {
      messages: messages,
    },
    components: {
      AddPersistentVolumeClaim,
      NamespaceFilter,
      ScalePersistentVolumeClaim,
      UpdatePersistentVolumeClaim,
    },
    mixins: [BaseFilter, BasePermission, BaseResource, BaseTable],
    data: () => ({
      items: [],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
      },
    }),
    computed: {
      ...mapState(['JWT', 'AdminViewport']),
      headers() {
        const items = [
          { text: this.$t('table.name'), value: 'name', align: 'start' },
          { text: this.$root.$t('resource.type'), value: 'type', align: 'start', sortable: false },
          { text: this.$t('table.status'), value: 'status', align: 'start', sortable: false },
          {
            text: this.$t('table.access_mode'),
            value: 'accessMode',
            align: 'start',
            sortable: false,
          },
          { text: this.$t('table.storage'), value: 'storage', align: 'start', sortable: false },
          { text: this.$t('table.mount'), value: 'mount', align: 'start', sortable: false, width: 120 },
          { text: this.$root.$t('resource.create_at'), value: 'createAt', align: 'start', width: 200 },
        ];
        if (this.m_permisson_resourceAllow) {
          items.push({
            text: '',
            value: 'action',
            align: 'center',
            width: 20,
            sortable: false,
          });
        }
        if (this.AdminViewport) {
          items.splice(1, 0, {
            text: this.$root.$t('resource.namespace'),
            value: 'namespace',
            align: 'start',
            sortable: false,
            width: 300,
          });
        }
        return items;
      },
      filters() {
        return [{ text: this.$t('filter.pvc_name'), value: 'search', items: [] }];
      },
    },
    watch: {
      '$store.state.NamespaceFilter': {
        handler: function (namespace) {
          if (namespace && !namespace.Mounted) {
            this.params.page = 1;
            this.params.namespace = namespace.Namespace;
            this.persistentVolumeClaimList();
          }
        },
        deep: true,
      },
      m_table_sortparam: {
        handler: function (newV, oldV) {
          if (oldV.name !== newV.name) return;
          if (oldV.desc === null) return;
          this.persistentVolumeClaimList(true);
        },
        deep: true,
      },
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          if (this.ThisCluster === '') {
            this.$store.commit('SET_SNACKBAR', {
              text: this.$root.$t('tip.select_cluster'),
              color: 'warning',
            });
            return;
          }
          this.m_table_generateParams();
          this.persistentVolumeClaimList();
        });
      }
    },
    methods: {
      async persistentVolumeClaimList(noprocess = false) {
        const data = await getPersistentVolumeClaimList(
          this.ThisCluster,
          this.ThisNamespace,
          Object.assign(this.params, {
            noprocessing: noprocess,
            sort: this.m_table_generateResourceSortParamValue(),
          }),
        );
        this.items = data.List;
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
        this.$router.replace({ query: { ...this.$route.query, ...this.params } });
        this.m_table_generateSelectResource();
      },
      persistentVolumeClaimDetail(item) {
        this.$router.push({
          name: 'persistentvolumeclaim-detail',
          params: Object.assign(this.$route.params, {
            name: item.metadata.name,
          }),
          query: {
            namespace: item.metadata.namespace,
          },
        });
      },
      addPersistentVolumeClaim() {
        this.$refs.addPersistentVolumeClaim.open();
      },
      updatePersistentVolumeClaim(item) {
        this.$refs.updatePersistentVolumeClaim.init(item);
        this.$refs.updatePersistentVolumeClaim.open();
      },
      addVolumeSnapshot(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.create_c', [this.$root.$t('resource.volumesnapshot')]),
          content: {
            text: `${this.$root.$t('operate.create_c', [this.$root.$t('resource.volumesnapshot')])} ${
              item.metadata.name
            }`,
            type: 'confirm',
          },
          param: { item },
          doFunc: async (param) => {
            if (param.item.metadata.name.length > 0) {
              await postAddVolumeSnapshot(this.ThisCluster, param.item.metadata.namespace, {
                persistentVolumeClaimName: param.item.metadata.name,
              });
            }
          },
        });
      },
      scalePersistentVolumeClaim(item) {
        this.$refs.scalePersistentVolumeClaim.init(item);
        this.$refs.scalePersistentVolumeClaim.open();
      },
      removePersistentVolumeClaim(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.persistentvolumeclaim')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.persistentvolumeclaim')])} ${
              item.metadata.name
            }`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            if (param.item.metadata.name.length > 0) {
              await deletePersistentVolumeClaim(
                this.ThisCluster,
                param.item.metadata.namespace,
                param.item.metadata.name,
              );
              this.persistentVolumeClaimList();
            }
          },
        });
      },
      onPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onPageIndexChange(page) {
        this.params.page = page;
      },
      getMountStatus(item) {
        if (item.metadata.annotations && item.metadata.annotations[`storage.kubegems.io/in-use`] === 'true') {
          return this.$t('status.mounted');
        }
        if (item.metadata.annotations && item.metadata.annotations[`storage.kubegems.io/in-use`] === 'false') {
          return this.$t('status.unmounted');
        }
        return this.$root.$t('data.unknown');
      },
    },
  };
</script>
