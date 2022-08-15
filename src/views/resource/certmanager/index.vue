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
          :default="{ items: [], text: $t('filter.cert_name'), value: 'search' }"
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
                <v-btn color="primary" text @click="addCertificate">
                  <v-icon left>mdi-book-open</v-icon>
                  {{
                    tab === 0
                      ? $root.$t('operate.create_c', [$root.$t('resource.certificate')])
                      : $root.$t('operate.create_c', [$root.$t('resource.issuer')])
                  }}
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn
                  color="error"
                  text
                  @click="
                    m_table_batchRemoveResource(
                      tab === 0 ? $root.$t('resource.certificate') : $root.$t('resource.issuer'),
                      tab === 0 ? 'Certificate' : 'Issuer',
                      certificateList,
                    )
                  "
                >
                  <v-icon left>mdi-minus-box</v-icon>
                  {{
                    tab === 0
                      ? $root.$t('operate.delete_c', [$root.$t('resource.certificate')])
                      : $root.$t('operate.delete_c', [$root.$t('resource.issuer')])
                  }}
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-card-title>

      <v-card-text class="py-0">
        <v-tabs v-model="tab" class="rounded-t" height="30" @change="onTabChange">
          <v-tab v-for="item in tabItems" :key="item.value">
            {{ item.text }}
          </v-tab>
        </v-tabs>
        <v-data-table
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
            <a v-if="tabItems[tab].value === 'Certificate'" class="text-subtitle-2" @click="certificateDetail(item)">
              {{ item.metadata.name }}
            </a>
            <span v-else>{{ item.metadata.name }}</span>
          </template>
          <template #[`item.namespace`]="{ item }">
            {{ item.metadata.namespace }}
          </template>
          <template #[`item.issuer`]="{ item }">
            {{ item.spec.issuerRef.name }}
          </template>
          <template #[`item.server`]="{ item }">
            {{ item.spec.acme ? item.spec.acme.server : '' }}
          </template>
          <template #[`item.issuerMechanism`]="{ item }">
            {{ item.spec.selfSigned ? 'SelfSigned' : 'Let’s Encrypt' }}
          </template>
          <template #[`item.expireAt`]="{ item }">
            {{ item && item.status && item.status.notAfter ? $moment(item.status.notAfter).format('lll') : '' }}
          </template>
          <template #[`item.renewalTime`]="{ item }">
            {{ item && item.status && item.status.renewalTime ? $moment(item.status.renewalTime).format('lll') : '' }}
          </template>
          <template #[`item.createAt`]="{ item }">
            {{ item.metadata.creationTimestamp ? $moment(item.metadata.creationTimestamp).format('lll') : '' }}
          </template>
          <template #[`item.status`]="{ item, index }">
            <v-flex :id="`e${item.metadata.resourceVersion}`" />
            <EventTip
              :item="item"
              kind="Certificate"
              :top="params.size - index <= 5 || (items.length <= 5 && index >= 1)"
            >
              <template #trigger>
                <span>
                  {{ getStatus(item.status ? item.status.conditions : null).join(',') }}
                </span>
              </template>
            </EventTip>
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
                <v-card-text class="pa-2">
                  <v-flex>
                    <v-btn color="primary" small text @click="updateCertificate(item)">
                      {{ $root.$t('operate.edit') }}
                    </v-btn>
                  </v-flex>
                  <v-flex>
                    <v-btn color="error" small text @click="removeCertificate(item)">
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
          @loaddata="certificateList"
        />
      </v-card-text>
    </v-card>

    <AddCertificate ref="addCertificate" @refresh="certificateList" />
    <UpdateCertificate ref="updateCertificate" @refresh="certificateList" />
    <AddIssuer ref="addIssuer" @refresh="certificateList" />
    <UpdateIssuer ref="updateIssuer" @refresh="certificateList" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import AddCertificate from './components/AddCertificate';
  import AddIssuer from './components/AddIssuer';
  import UpdateCertificate from './components/UpdateCertificate';
  import UpdateIssuer from './components/UpdateIssuer';
  import messages from './i18n';
  import { deleteCertificate, deleteIssuer, getCertificateList, getIssuerList } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseTable from '@/mixins/table';
  import EventTip from '@/views/resource/components/common/EventTip';
  import NamespaceFilter from '@/views/resource/components/common/NamespaceFilter';

  export default {
    name: 'CertificateList',
    i18n: {
      messages: messages,
    },
    components: {
      AddCertificate,
      AddIssuer,
      EventTip,
      NamespaceFilter,
      UpdateCertificate,
      UpdateIssuer,
    },
    mixins: [BaseFilter, BasePermission, BaseResource, BaseTable],
    data() {
      this.tabMap = {
        certificate: 0,
        issuer: 1,
      };

      return {
        items: [],
        pageCount: 0,
        params: {
          page: 1,
          size: 10,
        },
        tab: this.tabMap[this.$route.query.tab] || 0,
      };
    },
    computed: {
      ...mapState(['JWT', 'AdminViewport']),
      headers() {
        let items = [];
        if (this.tab === 0) {
          items = [
            { text: this.$t('table.name'), value: 'name', align: 'start' },
            { text: this.$t('table.issuer'), value: 'issuer', align: 'start', sortable: false },
            { text: this.$t('table.status'), value: 'status', align: 'start', sortable: false },
            {
              text: this.$t('table.expire_at'),
              value: 'expireAt',
              align: 'start',
              sortable: false,
            },
            {
              text: this.$t('table.renew_at'),
              value: 'renewalTime',
              align: 'start',
              sortable: false,
            },
            { text: this.$root.$t('resource.create_at'), value: 'createAt', align: 'start', width: 180 },
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
        } else {
          items = [
            { text: this.$t('table.name'), value: 'name', align: 'start' },
            {
              text: this.$t('table.issuer_type'),
              value: 'issuerMechanism',
              align: 'start',
              sortable: false,
            },
            {
              text: 'Server',
              value: 'server',
              align: 'start',
              sortable: false,
            },
            { text: this.$root.$t('resource.create_at'), value: 'createAt', align: 'start', width: 180 },
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
        }
        if (this.AdminViewport) {
          items.splice(1, 0, {
            text: this.$root.$t('resource.namespace'),
            value: 'namespace',
            align: 'start',
            sortable: false,
          });
        }
        return items;
      },
      filters() {
        return [{ text: this.$t('filter.cert_name'), value: 'search', items: [] }];
      },
      tabItems() {
        return [
          { text: this.$root.$t('resource.certificate'), value: 'Certificate', tab: 'certificate' },
          { text: this.$root.$t('resource.issuer'), value: 'Issuer', tab: 'issuer' },
        ];
      },
    },
    watch: {
      '$store.state.NamespaceFilter': {
        handler: function (namespace) {
          if (namespace && !namespace.Mounted) {
            this.params.page = 1;
            this.params.namespace = namespace.Namespace;
            this.certificateList();
          }
        },
        deep: true,
      },
      m_table_sortparam: {
        handler: function (newV, oldV) {
          if (oldV.name !== newV.name) return;
          if (oldV.desc === null) return;
          this.certificateList(true);
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
          this.certificateList();
        });
      }
    },
    methods: {
      async certificateList(noprocess = false) {
        let data = null;
        if (this.tab === 0) {
          data = await getCertificateList(
            this.ThisCluster,
            this.ThisNamespace,
            Object.assign(this.params, {
              noprocessing: noprocess,
              sort: this.m_table_generateResourceSortParamValue(),
            }),
          );
        } else {
          data = await getIssuerList(
            this.ThisCluster,
            this.ThisNamespace,
            Object.assign(this.params, {
              noprocessing: noprocess,
              sort: this.m_table_generateResourceSortParamValue(),
            }),
          );
        }
        this.items = data.List;
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
        this.$router.replace({
          query: { ...this.$route.query, ...this.params, tab: this.tabItems[this.tab].tab },
        });
        this.m_table_generateSelectResource();
      },
      async onTabChange() {
        this.params.page = 1;
        this.items = [];
        this.pageCount = 0;
        await this.certificateList();
      },
      certificateDetail(item) {
        this.$router.push({
          name: 'certificate-detail',
          params: Object.assign(this.$route.params, {
            name: item.metadata.name,
          }),
          query: {
            namespace: item.metadata.namespace,
          },
        });
      },
      addCertificate() {
        if (this.tab === 0) this.$refs.addCertificate.open();
        else this.$refs.addIssuer.open();
      },
      updateCertificate(item) {
        if (this.tab === 0) {
          this.$refs.updateCertificate.init(item);
          this.$refs.updateCertificate.open();
        } else {
          this.$refs.updateIssuer.init(item);
          this.$refs.updateIssuer.open();
        }
      },
      removeCertificate(item) {
        if (this.tab === 0) {
          this.$store.commit('SET_CONFIRM', {
            title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.certificate')]),
            content: {
              text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.certificate')])} ${
                item.metadata.name
              }`,
              type: 'delete',
              name: item.metadata.name,
            },
            param: { item },
            doFunc: async (param) => {
              if (param.item.metadata.name.length > 0) {
                await deleteCertificate(this.ThisCluster, param.item.metadata.namespace, param.item.metadata.name);
                this.certificateList();
              }
            },
          });
        } else {
          this.$store.commit('SET_CONFIRM', {
            title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.issuer')]),
            content: {
              text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.issuer')])} ${item.metadata.name}`,
              type: 'delete',
              name: item.metadata.name,
            },
            param: { item },
            doFunc: async (param) => {
              if (param.item.metadata.name.length > 0) {
                await deleteIssuer(this.ThisCluster, param.item.metadata.namespace, param.item.metadata.name);
                this.certificateList();
              }
            },
          });
        }
      },
      onPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onPageIndexChange(page) {
        this.params.page = page;
      },
      getStatus(conditions) {
        const tmpConditions = [];
        if (conditions && conditions.length === 0) return ['Unknown'];
        conditions.forEach((con) => {
          if (con.type === 'Ready') {
            if (con.status === 'True') {
              tmpConditions.push(con.type);
              return tmpConditions;
            } else if (con.status === 'Unknown') {
              tmpConditions.push('Unknown');
            } else {
              tmpConditions.push('NotReady');
            }
          } else {
            if (con.status === 'True') {
              tmpConditions.push(con.type);
            }
          }
        });

        if (tmpConditions.length > 1 && tmpConditions.indexOf('Ready') > -1) {
          const index = tmpConditions.indexOf('Ready');
          tmpConditions.splice(index, 1);
        }

        return tmpConditions;
      },
    },
  };
</script>
