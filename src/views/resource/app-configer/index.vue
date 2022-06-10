<template>
  <v-container fluid>
    <BaseViewportHeader />

    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right mr-3">
          <span class="text-body-2 kubegems__text">
            nacos信息
          </span>
        </v-flex>
      </template>
    </BaseBreadcrumb>

    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :filters="filters"
          :reload="false"
          :default="{ items: [], text: '密钥名称', value: 'search' }"
          @refresh="m_filter_list"
          @filter="customFilter"
        />

        <v-spacer />
        <v-menu
          left
        >
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon
                small
                color="primary"
                v-on="on"
              >
                fas fa-ellipsis-v
              </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn
                  text
                  color="primary"
                  @click="openCreateDialog"
                >
                  <v-icon left>mdi-key-plus</v-icon>
                  创建配置项
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-card-title>
      <v-data-table
        class="mx-4"
        :headers="headers"
        :items="items"
        :page.sync="params.page"
        :items-per-page="params.size"
        no-data-text="暂无数据"
        hide-default-footer
        @page-count="pageCount = $event"
      >
        <template #[`item.action`]="{ item, index }">
          <v-flex :id="`r${index}`" />
          <v-menu
            left
            :attach="`#r${index}`"
          >
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon
                  x-small
                  color="primary"
                  v-on="on"
                >
                  fas fa-ellipsis-v
                </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn
                    color="primary"
                    text
                    small
                    @click="openEditDialog(item, index)"
                  >
                    编辑/查看
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn
                    color="primary"
                    text
                    small
                    @click="openHistoryDialog(item)"
                  >
                    历史
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn
                    color="error"
                    text
                    small
                    @click="openDeleteDialog(item, index)"
                  >
                    删除
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
        :front-page="true"
        :page-count="pageCount"
        :size="params.size"
        @loaddata="appConfigList"
        @changesize="onPageSizeChange"
        @changepage="onPageIndexChange"
      />
    </v-card>

    <ConfigEditor
      :item="editor.currentEditItem"
      :show-edit-dialog="editor.showEditDialog"
      :is-create="editor.isCreate"
      @close="closeEditDialog"
      @submit="submitEditContent"
    />
    <DeleteItem
      :show-delete-dialog="editor.showDeleteDialog"
      :item="editor.currentDeleteItem"
      :idx="editor.deleteIdx"
      @close="closeDeleteDialog"
      @delete="submitDeleteItem"
    />
    <HistoryView
      :show-history-dialog="editor.showHistoryDialog"
      :history-item="editor.currentHistoryItem"
      @close="closeHistoryDialog"
    />
  </v-container>
</template>

<script>
import { listConfigItems, pubConfigItems, delConfigItems } from './api/index.js'
import { mapGetters, mapState } from 'vuex'
import ConfigEditor from './components/ConfigEditor'
import DeleteItem from './components/DeleteItem'
import HistoryView from './components/HistoryView'
import BaseFilter from '@/mixins/base_filter'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'ConfigeUI',
  components: {
    ConfigEditor,
    DeleteItem,
    HistoryView,
  },
  mixins: [BaseFilter],
  data () {
    return {
      editor: {
        currentEditItem: {},
        showEditDialog: false,
        isCreate: false,
        editIdx: -1,
        showDeleteDialog: false,
        currentDeleteItem: {},
        deleteIdx: -1,
        showHistoryDialog: false,
        currentHistoryItem: {},
      },
      items: [],
      itemsCopy: [],
      headers: [
        { text: 'app', value: 'application', align: 'start' },
        { text: 'dataid', value: 'key', align: 'start' },
        { text: '', value: 'action', align: 'center', width: 20, sortable: false },
      ],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
      },
      filters: [{ text: '配置名称', value: 'search', items: [] }],
    }
  },
  computed: {
    ...mapState(['JWT', 'Admin', 'AdminViewport', 'MessageStreamWS']),
    ...mapGetters(['Tenant', 'Environment', 'Project']),
  },
  mounted () {
    this.appConfigList()
  },
  methods: {
   async appConfigList() {
      const datas = await listConfigItems(
        this.Tenant().TenantName || "",
        this.Project().ProjectName || "",
        this.Environment().EnvironmentName || "")
      this.items = datas
      this.itemsCopy = deepCopy(datas)
    },
    customFilter() {
      if (this.$route.query.search && this.$route.query.search.length > 0) {
        this.items = this.itemsCopy.filter((item) => {
          return (
            item.application &&
            item.application
              .toLocaleLowerCase()
              .indexOf(this.$route.query.search.toLocaleLowerCase()) > -1
          )
        })
      } else {
        this.items = this.itemsCopy
      }
      // this.m_table_generateSelectResource()
    },
    onPageSizeChange(size) {
      this.params.page = 1
      this.params.size = size
    },
    onPageIndexChange(page) {
      this.params.page = page
    },
    openEditDialog (item, idx) {
      this.editor.editIdx = idx
      this.editor.currentEditItem = {
        tenant: (this.Tenant() || { TenantName: "" }).TenantName,
        project: (this.Project() || { ProjectName: "" }).ProjectName,
        environment: (this.Environment() || { EnvironmentName: "" }).EnvironmentName,
        ...item,
      }
      this.editor.isCreate = false
      this.editor.showEditDialog = true
    },
    openCreateDialog () {
      this.editor.editIdx = -1
      this.editor.currentEditItem = {
        tenant: (this.Tenant() || { TenantName: "" }).TenantName,
        project: (this.Project() || { ProjectName: "" }).ProjectName,
        environment: (this.Environment() || { EnvironmentName: "" }).EnvironmentName,
        application: "",
        key: "",
        value: "",
      }
      this.editor.isCreate = true
      this.editor.showEditDialog = true
    },
    openDeleteDialog (item, idx) {
      this.editor.currentDeleteItem = item
      this.editor.deleteIdx = idx
      this.editor.showDeleteDialog = true
    },
    closeEditDialog() {
      this.editor.showEditDialog = false
      this.editor.editIdx = -1
      this.editor.currentEditItem = {
        tenant: (this.Tenant() || { TenantName: "" }).TenantName,
        project: (this.Project() || { ProjectName: "" }).ProjectName,
        environment: (this.Environment() || { EnvironmentName: "" }).EnvironmentName,
        application: "",
        key: "",
        value: "",
      }
    },
    closeDeleteDialog() {
      this.editor.currentDeleteItem = {}
      this.editor.deleteIdx = -1
      this.editor.showDeleteDialog = false
    },
    closeHistoryDialog() {
      this.editor.showHistoryDialog = false
      this.editor.currentHistoryItem = {}
    },
    async openHistoryDialog(item) {
      this.editor.showHistoryDialog = true
      this.editor.currentHistoryItem = item
    },
    async submitDeleteItem(idx) {
      await delConfigItems(
        this.editor.currentDeleteItem.tenant,
        this.editor.currentDeleteItem.project,
        this.editor.currentDeleteItem.application,
        this.editor.currentDeleteItem.environment,
        this.editor.currentDeleteItem.key,
      )
      this.items.splice(idx, 1)
      this.closeDeleteDialog()
    },
    async submitEditContent(editItem, isCreate) {
      if (editItem.value === this.editor.currentEditItem.value) {
        this.closeEditDialog()
        return
      }
      const res = await pubConfigItems(
        editItem.tenant,
        editItem.project,
        editItem.application,
        editItem.environment,
        editItem.key,
        editItem.value,
      )
      if (isCreate) {
        this.items.push(res)
      } else {
        this.items[this.editor.editIdx].value = editItem.value
      }
      this.closeEditDialog()
    },
  },
}
</script>
