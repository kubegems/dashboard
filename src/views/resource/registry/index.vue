<template>
  <v-container fluid>
    <BaseViewportHeader v-if="!AdminViewport" :environmented="false" />
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :filters="filters"
          :default="{ items: [], text: '镜像仓库名称', value: 'search' }"
          @refresh="m_filter_list"
        />
        <v-spacer />
        <v-menu v-if="m_permisson_resourceAllow" left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon small color="primary" v-on="on"> fas fa-ellipsis-v </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn text color="primary" @click="addRegistry">
                  <v-icon left>mdi-database-plus</v-icon>
                  创建镜像仓库
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-card-title>
      <v-data-table
        class="mx-4"
        disable-sort
        :headers="headers"
        :items="items"
        :page.sync="params.page"
        :items-per-page="params.size"
        no-data-text="暂无数据"
        hide-default-footer
      >
        <template #[`item.registryName`]="{ item }">
          {{ item.RegistryName }}
        </template>
        <template #[`item.registryAddress`]="{ item }">
          {{ item.RegistryAddress }}
        </template>
        <template #[`item.updateAt`]="{ item }">
          {{ item.UpdateAt ? $moment(item.UpdateAt).format('lll') : '' }}
        </template>
        <template #[`item.username`]="{ item }">
          {{ item.Username }}
        </template>
        <template #[`item.creator`]="{ item }">
          {{ item.Creator.Username }}
        </template>
        <template #[`item.project`]="{ item }">
          {{ item.Project.ProjectName }}
        </template>
        <template #[`item.isDefault`]="{ item }">
          {{ item.IsDefault ? '是' : '否' }}
        </template>
        <template #[`item.action`]="{ item }">
          <v-flex :id="`r${item.ID}`" />
          <v-menu left :attach="`#r${item.ID}`">
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon x-small color="primary" v-on="on"> fas fa-ellipsis-v </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex v-if="item.IsDefault">
                  <v-btn color="error" text small @click="setDefaultRegistry(item, false)"> 取消默认仓库 </v-btn>
                </v-flex>
                <v-flex v-else>
                  <v-btn color="primary" text small @click="setDefaultRegistry(item, true)"> 置为默认仓库 </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="primary" text small @click="updateRegistry(item)"> 编辑 </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" text small @click="removeRegistry(item)"> 删除 </v-btn>
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
        @loaddata="registryList"
        @changesize="onPageSizeChange"
        @changepage="onPageIndexChange"
      />
    </v-card>

    <AddRegistry ref="addRegistry" @refresh="registryList" />
    <UpdateRegistry ref="updateRegistry" @refresh="registryList" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import AddRegistry from './components/AddRegistry';
  import UpdateRegistry from './components/UpdateRegistry';
  import { getRegistryList, deleteRegistry, getRegistryAllList, patchSetDefaultRegistry } from '@/api';
  import BaseResource from '@/mixins/resource';
  import BasePermission from '@/mixins/permission';
  import BaseFilter from '@/mixins/base_filter';
  import BaseTable from '@/mixins/table';
  import { convertStrToNum } from '@/utils/helpers';

  export default {
    name: 'Registry',
    components: {
      AddRegistry,
      UpdateRegistry,
    },
    mixins: [BaseFilter, BaseResource, BasePermission, BaseTable],
    data: () => ({
      items: [],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
      },
      filters: [{ text: '镜像仓库名称', value: 'search', items: [] }],
    }),
    computed: {
      ...mapState(['Admin', 'AdminViewport', 'JWT']),
      ...mapGetters(['Project']),
      headers() {
        const items = [
          { text: '仓库名称', value: 'registryName', align: 'start' },
          { text: '仓库地址', value: 'registryAddress', align: 'start' },
          { text: '默认仓库', value: 'isDefault', align: 'start' },
          { text: '用户名', value: 'username', align: 'start' },
          { text: '创建人', value: 'creator', align: 'start' },
          { text: '最近更新时间', value: 'updateAt', align: 'start' },
        ];
        if (this.Admin && this.AdminViewport) {
          items.splice(1, 0, {
            text: '项目',
            value: 'project',
            align: 'start',
          });
        }
        if (this.m_permisson_resourceAllow) {
          items.push({ text: '', value: 'action', align: 'center', width: 20 });
        }
        return items;
      },
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          if (!this.AdminViewport && this.Project().ID === 0) {
            return;
          }
          Object.assign(this.params, convertStrToNum(this.$route.query));
          this.registryList();
        });
      }
    },
    methods: {
      async registryList() {
        let data = {};
        if (this.Admin && this.AdminViewport) {
          data = await getRegistryAllList(this.params);
        } else {
          data = await getRegistryList(this.Project().ID, this.params);
        }
        this.items = data.List.map((item) => {
          return {
            name: item.TenantName,
            ...item,
          };
        });
        this.m_table_generateSelectResourceNoK8s('ProjectName', 'ID');
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
        this.$router.replace({ query: { ...this.$route.query, ...this.params } });
      },
      addRegistry() {
        if (!this.AdminViewport && this.Project().ID === 0) {
          this.$store.commit('SET_SNACKBAR', {
            text: '请先选择项目',
            color: 'warning',
          });
          return;
        }
        this.$refs.addRegistry.open();
      },
      updateRegistry(item) {
        this.$refs.updateRegistry.init(item);
        this.$refs.updateRegistry.open();
      },
      removeRegistry(item) {
        this.$store.commit('SET_CONFIRM', {
          title: `删除镜像仓库`,
          content: {
            text: `删除镜像仓库 ${item.RegistryName}`,
            type: 'delete',
            name: item.RegistryName,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteRegistry({
              projectid: param.item.ProjectID,
              registryid: param.item.ID,
            });
            this.registryList();
          },
        });
      },
      setDefaultRegistry(item, isDefault) {
        this.$store.commit('SET_CONFIRM', {
          title: `设置默认镜像仓库`,
          content: {
            text: isDefault
              ? `将镜像仓库 ${item.RegistryName} 置为默认仓库`
              : `取消镜像仓库 ${item.RegistryName} 的默认设置`,
            type: 'confirm',
          },
          param: { item, isDefault },
          doFunc: async (param) => {
            await patchSetDefaultRegistry(
              {
                projectid: param.item.ProjectID,
                registryid: param.item.ID,
              },
              {
                isDefault: param.isDefault,
              },
            );
            this.registryList();
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
    },
  };
</script>
