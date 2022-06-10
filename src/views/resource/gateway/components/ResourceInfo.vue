<template>
  <div>
    <v-card>
      <v-sheet class="pa-2">
        <BaseListItemForDetail title="实例数" :mt="0">
          <template #content>
            {{ gateway ? gateway.status.availableReplicas : 0 }} 个实例可用，{{
              gateway ? gateway.spec.replicas - gateway.status.availableReplicas : 0
            }}
            个实例不可用
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="generation">
          <template #content>
            {{ gateway ? gateway.metadata.generation : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="租户">
          <template #content>
            {{ gateway ? gateway.spec.tenant : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="类型">
          <template #content>
            {{
              gateway && gateway.spec && gateway.spec.type === 'LoadBalancer'
                ? '外部负载均衡网关(LoadBalancer)'
                : '常规集群网关(NodePort)'
            }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="默认域名">
          <template #content>
            {{ gateway ? gateway.spec.baseDomain : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="工作负载附加标签">
          <template #content>
            <BaseCollapseChips
              v-if="gateway"
              :chips="gateway.spec.workload.extraLabels || {}"
              single-line
              icon="mdi-label"
            />
          </template>
        </BaseListItemForDetail>
      </v-sheet>
    </v-card>

    <v-card class="mt-3">
      <BaseSubTitle title="网关端口" :divider="false" class="pt-2" />
      <v-simple-table class="mx-2 pa-2 pb-3">
        <template #default>
          <thead>
            <tr>
              <th class="text-left">容器端口</th>
              <th class="text-left">服务端口</th>
              <th class="text-left">主机端口</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in gateway ? gateway.status.ports : []" :key="index">
              <td>
                <v-chip color="success" text-color="white" class="ma-1 font-weight-medium" small>
                  {{ item.targetPort }}｜{{ item.protocol }}
                </v-chip>
              </td>
              <td>
                <v-chip color="success" text-color="white" class="ma-1 font-weight-medium" small>
                  {{ item.port }}｜{{ item.protocol }}
                </v-chip>
              </td>
              <td>{{ item.nodePort }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>

    <v-card class="mt-3">
      <BaseSubTitle title="网关地址" :divider="false" class="pt-2" />
      <v-flex class="pl-4 kubegems__text py-2 text-subtitle-1">HTTP</v-flex>
      <v-simple-table class="mx-2 pa-2 rounded">
        <template #default>
          <tbody>
            <tr
              v-for="(item, index) in addresses.filter((a) => {
                return a.Addr.indexOf('http://') > -1;
              })"
              :key="index"
            >
              <td style="width: 50%">{{ item.Addr }}</td>
              <td style="width: 45%">
                <template v-if="item.Ready">
                  <v-icon small color="primary"> fas fa-check-circle </v-icon>
                  正常
                </template>
                <template v-else>
                  <v-icon small color="error"> fas fa-times-circle </v-icon>
                  异常
                </template>
              </td>
              <td style="text-align: end">
                <v-btn x-small text color="primary" @click="toAddress(item.Addr)"> 访问 </v-btn>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>

      <v-flex class="pl-4 kubegems__text py-2 text-subtitle-1">HTTPS</v-flex>
      <v-simple-table class="mx-2 pa-2 rounded">
        <template #default>
          <tbody>
            <tr
              v-for="(item, index) in addresses.filter((a) => {
                return a.Addr.indexOf('https://') > -1;
              })"
              :key="index"
            >
              <td style="width: 50%">{{ item.Addr }}</td>
              <td style="width: 45%">
                <template v-if="item.Ready">
                  <v-icon small color="primary"> fas fa-check-circle </v-icon>
                  正常
                </template>
                <template v-else>
                  <v-icon small color="error"> fas fa-times-circle </v-icon>
                  异常
                </template>
              </td>
              <td style="text-align: end">
                <v-btn x-small text color="primary" @click="toAddress(item.Addr)"> 访问 </v-btn>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import { getGatewayDetail, getGatewayAddressList } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'ResourceInfo',
    mixins: [BaseResource],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        gateway: null,
        addresses: [],
      };
    },
    computed: {
      ...mapState(['JWT']),
      ...mapGetters(['Tenant']),
    },
    watch: {
      item() {
        this.gateway = deepCopy(this.item);
        this.gatewayDetail();
      },
    },
    mounted() {
      if (this.item) {
        this.gateway = deepCopy(this.item);
        this.gatewayDetail();
      }
    },
    methods: {
      async gatewayDetail() {
        const data = await getGatewayDetail(this.Tenant().ID, this.ThisClusterID, this.$route.params.name, {
          noprocessing: true,
        });
        this.gateway = data;
        this.gatewayAddressList();
      },
      async gatewayAddressList() {
        const data = await getGatewayAddressList(this.Tenant().ID, this.ThisClusterID, this.$route.params.name, {
          noprocessing: true,
        });
        this.addresses = data || [];
      },
      toAddress(address) {
        window.open(address);
      },
    },
  };
</script>
