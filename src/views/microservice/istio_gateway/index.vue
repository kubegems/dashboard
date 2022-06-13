<template>
  <v-container fluid>
    <BaseMicroServiceHeader />
    <BaseBreadcrumb />
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter
          :filters="filters"
          :default="{ items: [], text: '网关实例名称', value: 'search' }"
          :reload="false"
          @refresh="m_filter_list"
          @filter="customFilter"
        />
        <EnvironmentFilter />
        <v-spacer />
      </v-card-title>
    </v-card>

    <v-row class="mt-3">
      <v-col v-for="(item, index) in items" :key="index" cols="3" class="pt-0">
        <v-hover #default="{ hover }">
          <v-card class="mx-auto" height="100%" :elevation="hover ? 5 : 0">
            <v-list-item three-line>
              <v-list-item-avatar class="primary--text" tile size="80">
                <Icon icon="simple-icons:istio" style="width: 80px; height: 80px; margin-left: 10px" />
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="text-h6 mb-1">
                  <a>
                    {{ item ? item.Name : '' }}
                  </a>
                </v-list-item-title>
                <v-list-item-subtitle>
                  <span class="text-body-2">
                    状态：
                    <v-icon
                      v-if="item && item.status && item.status.replicas === item.status.availableReplicas"
                      color="success"
                      small
                    >
                      mdi-check-circle
                    </v-icon>
                    <v-icon v-else-if="item.status && item.status.availableReplicas === 0" color="error" small>
                      mdi-close-circle
                    </v-icon>
                    <v-icon v-else color="warning" small> mdi-alert-circle </v-icon>
                  </span>
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                  <span class="text-body-2"> 端口： </span>
                  <span v-for="(port, index) in item ? item && item.ports : []" :key="index">
                    <span v-if="port.name === 'http2'">
                      http:
                      {{ port.nodePort === '' ? '-' : port.nodePort }}
                    </span>
                    <span v-if="port.name === 'https'">
                      https:
                      {{ port.nodePort === '' ? '-' : port.nodePort }}
                    </span>
                  </span>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-card-actions>
              <v-spacer />
              <v-btn text small color="primary" @click="istioGatewayDetail(item)"> 详 情 </v-btn>
              <v-btn
                v-if="m_permisson_virtualSpaceAllow"
                text
                small
                color="primary"
                @click="updateIstioInstanceGateway(item)"
              >
                编 辑
              </v-btn>
              <v-btn
                v-if="m_permisson_virtualSpaceAllow"
                text
                small
                color="error"
                @click="removeIstioGatewayInstance(item)"
              >
                删 除
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-hover>
      </v-col>
      <v-col v-if="m_permisson_virtualSpaceAllow" cols="3" class="pt-0">
        <v-card class="kubegems__full-height" min-height="156">
          <v-card-text class="pa-0 kubegems__full-height">
            <v-list-item three-line class="kubegems__full-height">
              <v-list-item-content>
                <v-btn text block color="primary" class="text-h6" @click="addIstioGatewayInstance">
                  <v-icon left>mdi-plus-box</v-icon>
                  创建网关实例
                </v-btn>
              </v-list-item-content>
            </v-list-item>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <AddIstioGateway ref="addIstioGateway" @refresh="istioGatewayInstanceList" />
    <UpdateIstioGateway ref="updateIstioGateway" @refresh="istioGatewayInstanceList" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import AddIstioGateway from './components/AddIstioGateway';
  import UpdateIstioGateway from './components/UpdateIstioGateway';
  import { getIstioGatewayInstanceList, deleteIstioGatewayInstance } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseFilter from '@/mixins/base_filter';
  import EnvironmentFilter from '@/views/microservice/components/EnvironmentFilter';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'IstioGateway',
    components: {
      EnvironmentFilter,
      AddIstioGateway,
      UpdateIstioGateway,
    },
    mixins: [BasePermission, BaseFilter],
    data: () => ({
      items: [],
      filters: [{ text: '网关实例名称', value: 'search', items: [] }],
      params: {},
    }),
    computed: {
      ...mapState(['JWT', 'EnvironmentFilter']),
      ...mapGetters(['VirtualSpace']),
    },
    watch: {
      '$store.state.EnvironmentFilter': {
        handler: function (env) {
          if (env) this.istioGatewayInstanceList();
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      customFilter() {
        if (this.$route.query.search && this.$route.query.search.length > 0) {
          this.items = this.itemsCopy.filter((item) => {
            return (
              item.Name && item.Name.toLocaleLowerCase().indexOf(this.$route.query.search.toLocaleLowerCase()) > -1
            );
          });
          if (this.m_permisson_virtualSpaceAllow) {
            this.items.push({ add: true });
          }
        } else {
          this.items = this.itemsCopy;
        }
      },
      async istioGatewayInstanceList() {
        const data = await getIstioGatewayInstanceList(
          this.VirtualSpace().ID,
          this.EnvironmentFilter.clusterid,
          this.params,
        );
        this.items = data;
        this.itemsCopy = deepCopy(this.items);
        this.customFilter();
      },
      addIstioGatewayInstance() {
        this.$refs.addIstioGateway.open();
      },
      updateIstioInstanceGateway(item) {
        this.$refs.updateIstioGateway.init(item);
        this.$refs.updateIstioGateway.open();
      },
      istioGatewayDetail(item) {
        this.$router.push({
          name: 'istiogateway-detail',
          params: Object.assign(this.$route.params, { name: item.Name }),
          query: {
            namespace: this.EnvironmentFilter.namespace,
            cluster: this.EnvironmentFilter.cluster,
            clusterid: this.EnvironmentFilter.clusterid,
            environment: this.EnvironmentFilter.text,
            environmentid: this.EnvironmentFilter.value,
          },
        });
      },
      async removeIstioGatewayInstance(item) {
        this.$store.commit('SET_CONFIRM', {
          title: `删除istio网关实例`,
          content: {
            text: `删除istio网关实例 ${item.Name}`,
            type: 'delete',
            name: item.Name,
          },
          param: { item },
          doFunc: async (param) => {
            if (param.item.Name.length > 0) {
              await deleteIstioGatewayInstance(
                this.VirtualSpace().ID,
                this.EnvironmentFilter.clusterid,
                param.item.Name,
              );
              this.istioGatewayInstanceList();
            }
          },
        });
      },
    },
  };
</script>
