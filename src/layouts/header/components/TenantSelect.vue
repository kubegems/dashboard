<template>
  <BaseDialog
    v-model="dialog"
    :width="800"
    title="选择租户"
    icon="mdi-account-multiple"
    @reset="reset"
  >
    <template #content>
      <v-flex class="grey lighten-4 rounded ma-2 mt-0">
        <v-list-item>
          <v-list-item-content class="kubegems__label-class-padding kubegems__break-all">
            当前租户：{{ Tenant().TenantName }}
          </v-list-item-content>
        </v-list-item>
      </v-flex>

      <v-text-field
        v-model="search"
        class="mx-2 mt-2 pt-0"
        hide-details
        prepend-inner-icon="mdi-magnify"
      />

      <v-sheet max-height="300px">
        <v-data-table
          :headers="headers"
          :items="m_select_tenantItems"
          :page.sync="params.page"
          :search.sync="search"
          :items-per-page="params.size"
          no-data-text="暂无数据"
          no-results-text="暂无匹配租户"
          hide-default-footer
          item-key="value"
          class="px-2"
        >
          <template #[`item.isActive`]="{ item }">
            <span v-if="item.isActive">
              <v-icon
                small
                color="primary"
              > fas fa-check-circle </v-icon>
              启用
            </span>
            <span v-else>
              <v-icon
                small
                color="error"
              >fas fa-minus-circle</v-icon>
              禁用
            </span>
          </template>
          <template #[`item.action`]="{ item }">
            <v-btn
              v-if="!item.disabled && item.isActive"
              small
              text
              color="primary"
              @click="setTenant(item)"
            >
              进入空间
            </v-btn>
          </template>
        </v-data-table>
      </v-sheet>
    </template>
  </BaseDialog>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { sleep } from '@/utils/helpers'
import BaseSelect from '@/mixins/select'

export default {
  name: 'TenantSelect',
  mixins: [BaseSelect],
  inject: ['reload'],
  data: () => ({
    dialog: false,
    headers: [
      { text: '租户', value: 'text', align: 'start' },
      { text: 'ID', value: 'value', align: 'start' },
      { text: '状态', value: 'isActive', align: 'start' },
      { text: '', value: 'action', align: 'end' },
    ],
    search: '',
    params: {
      page: 1,
      size: 1000,
    },
  }),
  computed: {
    ...mapState(['Circular']),
    ...mapGetters(['Tenant']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    // eslint-disable-next-line vue/no-unused-properties
    init() {
      this.m_select_tenantSelectData()
    },
    async setTenant(item) {
      this.$store.commit('CLEAR_RESOURCE')
      this.$store.commit('SET_ADMIN_VIEWPORT', false)
      this.$router.push({
        name: 'resource-dashboard',
        params: { tenant: item.text },
      })
      await this.$store.dispatch('UPDATE_TENANT_DATA')

      // 此处暂时性解决在切换租户空间时，其他组件Tenant getters未能正确获取到最新值问题
      this.$nextTick(async () => {
        await sleep(200)
        this.reload()
        this.reset()
      })
    },
    reset() {
      this.dialog = false
    },
  },
}
</script>
