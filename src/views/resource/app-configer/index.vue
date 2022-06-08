<template>
  <v-container
    fluid
    class="hello"
  >
    <BaseViewportHeader
      v-if="!AdminViewport"
      :environmented="Environment().ID > 0"
    />
    <BaseBreadcrumb :breadcrumb="breadcrumb" />
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
    <v-data-iterator
      :items="items"
      :items-per-page.sync="itemsPerPage"
      :search="search"
    >
      <template #header>
        <v-toolbar
          class="mb-2"
          flat
        >
          <v-text-field
            v-model="search"
            clearable
            flat
            hide-details
            prepend-inner-icon="mdi-magnify"
            label="Search"
          />
          <!-- v-toolbar-title> header todo </v-toolbar-title -->
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
                    <v-icon left>mdi-plus</v-icon>
                    创建配置项
                  </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-toolbar>
      </template>

      <template #default="props">
        <v-simple-table>
          <thead>
            <tr>
              <th class="text-left">
                app
              </th>
              <th class="text-left">
                key
              </th>
              <th class="text-left" />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, idx) in props.items"
              :key="idx"
            >
              <td>{{ item.application || "-" }}</td>
              <td>{{ item.key }}</td>
              <td>
                <v-flex class="float-right">
                  <v-btn
                    small
                    color="primary"
                    class="ma-md-2"
                    @click="openEditDialog(item, idx)"
                  >
                    编辑/查看
                  </v-btn>
                  <v-btn
                    small
                    color="primary"
                    class="ma-md-2"
                    @click="openHistoryDialog(item)"
                  >
                    历史
                  </v-btn>
                  <v-btn
                    small
                    color="red"
                    class="ma-md-2"
                    @click="openDeleteDialog(item, idx)"
                  >
                    删除
                  </v-btn>
                </v-flex>
              </td>
            </tr>
          </tbody>
        </v-simple-table>
      </template>
    </v-data-iterator>
  </v-container>
</template>

<script>
import { listConfigItems, pubConfigItems, delConfigItems } from './api/index.js';
import { mapGetters, mapState } from 'vuex'
import ConfigEditor from './components/ConfigEditor'
import DeleteItem from './components/DeleteItem'
import HistoryView from './components/HistoryView'
export default {
  name: 'ConfigeUI',
  components: {
    ConfigEditor,
    DeleteItem,
    HistoryView,
  },
  data () {
    return {
      search: '',
      breadcrumb: {
        title: '应用配置',
        tip: '如果启用了集群的配置插件，可以提供外部的动态配置服务给应用',
        icon: 'mdi-file-document-outline',
      },
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
      itemsPerPage: 10,
      items: [],
    }
  },
  computed: {
    ...mapState(['JWT', 'Admin', 'AdminViewport', 'MessageStreamWS']),
    ...mapGetters(['Tenant', 'Environment', 'Project']),
  },
  async mounted () {
    const datas = await listConfigItems(
      this.Tenant().TenantName || "",
      this.Project().ProjectName || "",
      this.Environment().EnvironmentName || "")
    this.items = datas
  },
  methods: {
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
      const res = await delConfigItems(
        this.editor.currentDeleteItem.tenant,
        this.editor.currentDeleteItem.project,
        this.editor.currentDeleteItem.application,
        this.editor.currentDeleteItem.environment,
        this.editor.currentDeleteItem.key,
      )
      console.log(res, "deleted")
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
        this.items[this.editor.editIdx].value = res.value
      }
      this.closeEditDialog()
    },
  },
}
</script>
