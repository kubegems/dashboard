<template>
  <v-container fluid>
    <BaseViewportHeader />
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :default="{ items: [], text: '证书名称', value: 'search' }"
          :filters="filters"
          @refresh="m_filter_list"
        />
        <NamespaceFilter />
        <v-spacer />
        <v-menu v-if="m_permisson_resourceAllow" left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" small v-on="on"> fas fa-ellipsis-v </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn color="primary" text @click="addCertificate">
                  <v-icon left>mdi-book-open</v-icon>
                  {{ tab === 0 ? '创建证书' : '创建颁发机构' }}
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn
                  color="error"
                  text
                  @click="
                    m_table_batchRemoveResource(
                      tab === 0 ? '证书' : '颁发机构',
                      tab === 0 ? 'Certificate' : 'Issuer',
                      certificateList,
                    )
                  "
                >
                  <v-icon left>mdi-minus-box</v-icon>
                  {{ tab === 0 ? '删除证书' : '删除颁发机构' }}
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
          no-data-text="暂无数据"
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
                  <v-icon color="primary" x-small v-on="on"> fas fa-ellipsis-v </v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-text class="pa-2">
                  <v-flex>
                    <v-btn color="primary" small text @click="updateCertificate(item)"> 编辑 </v-btn>
                  </v-flex>
                  <v-flex>
                    <v-btn color="error" small text @click="removeCertificate(item)"> 删除 </v-btn>
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
  import { getCertificateList, deleteCertificate, getIssuerList, deleteIssuer } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseTable from '@/mixins/table';
  import EventTip from '@/views/resource/components/common/EventTip';
  import NamespaceFilter from '@/views/resource/components/common/NamespaceFilter';

  export default {
    name: 'CertificateList',
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
        issue: 1,
      };

      return {
        items: [],
        pageCount: 0,
        params: {
          page: 1,
          size: 10,
        },
        filters: [{ text: '名称', value: 'search', items: [] }],
        tab: this.tabMap[this.$route.query.tab] || 0,
        tabItems: [
          { text: '证书', value: 'Certificate', tab: 'certificate' },
          { text: '颁发机构', value: 'Issue', tab: 'issue' },
        ],
      };
    },
    computed: {
      ...mapState(['JWT', 'AdminViewport']),
      headers() {
        let items = [];
        if (this.tab === 0) {
          items = [
            { text: '证书名', value: 'name', align: 'start' },
            { text: '颁发者', value: 'issuer', align: 'start', sortable: false },
            { text: '状态', value: 'status', align: 'start', sortable: false },
            {
              text: '到期时间',
              value: 'expireAt',
              align: 'start',
              sortable: false,
            },
            {
              text: '自动续签时间',
              value: 'renewalTime',
              align: 'start',
              sortable: false,
            },
            { text: '创建时间', value: 'createAt', align: 'start', width: 180 },
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
            { text: '机构名称', value: 'name', align: 'start' },
            {
              text: '颁发机构类型',
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
            { text: '创建时间', value: 'createAt', align: 'start', width: 180 },
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
            text: '命名空间',
            value: 'namespace',
            align: 'start',
            sortable: false,
          });
        }
        return items;
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
              text: `请创建或选择集群`,
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
            title: `删除证书`,
            content: {
              text: `删除证书 ${item.metadata.name}`,
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
            title: `删除颁发机构`,
            content: {
              text: `删除颁发机构 ${item.metadata.name}`,
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
