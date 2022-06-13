<template>
  <v-container fluid>
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <v-menu left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon x-small color="primary" v-on="on"> fas fa-ellipsis-v </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" text small @click="updateTenant"> 编辑 </v-btn>
                </v-flex>
                <template v-if="tenant">
                  <v-flex v-if="tenant.IsActive">
                    <v-btn color="error" text small @click="forbidTenant"> 禁用 </v-btn>
                  </v-flex>
                  <v-flex v-else>
                    <v-btn color="primary" text small @click="activeTenant"> 启用 </v-btn>
                  </v-flex>
                </template>
                <v-flex>
                  <v-btn color="error" text small @click="removeTenant"> 删除 </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-0">
      <v-col cols="2" class="pt-0">
        <v-card>
          <v-card-title class="text-h6 primary--text">
            {{ tenant ? tenant.TenantName : '' }}
          </v-card-title>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__text">
              <v-list-item-title class="text-subtitle-2"> 状态 </v-list-item-title>
              <v-list-item-subtitle>
                <span v-if="tenant ? tenant.IsActive : false">
                  <v-icon small color="primary"> fas fa-check-circle </v-icon>
                  启用
                </span>
                <span v-else>
                  <v-icon small color="error">fas fa-minus-circle</v-icon>
                  禁用
                </span>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__text">
              <v-list-item-title class="text-subtitle-2"> 创建时间 </v-list-item-title>
              <v-list-item-subtitle>
                {{ tenant && tenant.CreatedAt ? $moment(tenant.CreatedAt).format('lll') : '' }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-card>
      </v-col>
      <v-col cols="10" class="pt-0">
        <UserList :tenant="tenant" />

        <ResourceList class="mt-3" :tenant="tenant" />
      </v-col>
    </v-row>

    <UpdateTenant ref="updateTenant" @refresh="tenantDetail" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import UserList from './components/UserList';
  import ResourceList from './components/ResourceList';
  import UpdateTenant from './components/UpdateTenant';
  import { getTenantDetail, putForbideTenant, putActiveTenant, deleteTenant } from '@/api';
  import BaseSelect from '@/mixins/select';
  import BaseFilter from '@/mixins/base_filter';

  export default {
    name: 'TenantDetail',
    components: {
      UserList,
      ResourceList,
      UpdateTenant,
    },
    mixins: [BaseFilter, BaseSelect],
    data: () => ({
      tenant: null,
      tenantId: 0,
    }),
    computed: {
      ...mapState(['JWT']),
      ...mapGetters(['Tenant']),
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          this.tenantId = this.$route.query.id;
          this.tenantDetail();
        });
      }
    },
    methods: {
      async tenantDetail() {
        const data = await getTenantDetail(this.tenantId);
        this.tenant = data;
      },

      updateTenant() {
        this.$refs.updateTenant.init(this.tenant);
        this.$refs.updateTenant.open();
      },
      forbidTenant() {
        const item = this.tenant;
        this.$store.commit('SET_CONFIRM', {
          title: `禁用租户`,
          content: { text: `禁用租户 ${item.TenantName}`, type: 'confirm' },
          param: { item },
          doFunc: async (param) => {
            await putForbideTenant(param.item.ID);
            this.tenantDetail();
          },
        });
      },
      activeTenant() {
        const item = this.tenant;
        this.$store.commit('SET_CONFIRM', {
          title: `激活租户`,
          content: { text: `激活租户 ${item.TenantName}`, type: 'confirm' },
          param: { item },
          doFunc: async (param) => {
            await putActiveTenant(param.item.ID);
            this.tenantDetail();
          },
        });
      },
      removeTenant() {
        const item = this.tenant;
        this.$store.commit('SET_CONFIRM', {
          title: `删除租户`,
          content: {
            text: `删除租户 ${item.TenantName}`,
            type: 'delete',
            name: item.TenantName,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteTenant(param.item.ID);
            this.$store.commit('CLEAR_TENANT');
            this.$store.dispatch('UPDATE_TENANT_DATA');
            this.$router.push({ name: 'tenant-list', params: this.$route.params });
          },
        });
      },
    },
  };
</script>
